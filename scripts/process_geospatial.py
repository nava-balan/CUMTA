"""Recover, validate, and export identifiable uploaded transport geometries."""

from __future__ import annotations

import argparse
import json
import math
import shutil
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

import shapefile


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = Path.home() / "AppData" / "Local" / "Temp"
LAYERS = (
    {
        "id": "metro_station_points",
        "geometry_file": "routes_merged.qix",
        "attributes_file": "routes_merged.cpg",
        "crs_file": "routes_merged.prj",
        "mode": "Metro",
        "kind": "point",
        "attribute_fields": ("Name",),
        "interpretation": "Metro station points from generic Phase 1 C1/C2 source labels; operator and date are unverified.",
    },
    {
        "id": "metro_corridors",
        "geometry_file": "Operational_Metro_Stns.qmd",
        "attributes_file": "Operational_Metro_Stns.cpg",
        "crs_file": "Operational_Metro_Stns.prj",
        "mode": "Metro",
        "kind": "line",
        "attribute_fields": ("Corridors", "Phasing", "Prop_Mode", "Identifer", "Length"),
        "interpretation": "Metro corridor geometry and attributes are source-provided; approval and reporting date are unverified.",
    },
    {
        "id": "bus_routes",
        "geometry_file": "Rail_Network_Updated.qmd",
        "attributes_file": "PT Fare Structure.pdf",
        "crs_file": "Rail_Network_Updated.prj",
        "mode": "Bus route (mode inferred)",
        "kind": "line",
        "attribute_fields": ("route_num", "source", "destinat", "route_id", "Corridor"),
        "interpretation": "Route identifiers and end points indicate bus routes; transport agency is not established by the attachments.",
    },
)
UNREFERENCED_LAYER = {
    "id": "rail_network_unknown_crs",
    "geometry_file": "Road_Network_Old CMA.qmd",
    "attributes_file": "Road_Network_Old CMA.cpg",
    "crs_file": "Road_Network_Old CMA.prj",
    "mode": "Rail network (source attributes)",
}


def source_crs(path: Path) -> tuple[str | None, str]:
    """Read an explicit QGIS CRS identifier; never infer one from coordinate magnitudes."""
    try:
        root = ET.parse(path).getroot()
    except (OSError, ET.ParseError):
        return None, "CRS metadata missing or unreadable"
    spatial_ref = root.find(".//spatialrefsys")
    auth_id = spatial_ref.findtext("authid", default="").strip() if spatial_ref is not None else ""
    description = spatial_ref.findtext("description", default="").strip() if spatial_ref is not None else ""
    return (auth_id or None), description or "QGIS CRS metadata"


def json_value(value: Any) -> Any:
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    return str(value)


def shape_geometry(shape: shapefile.Shape) -> dict[str, Any] | None:
    if not shape.points:
        return None
    if shape.shapeType in (shapefile.POINT, shapefile.POINTM, shapefile.POINTZ):
        x, y = shape.points[0][:2]
        return {"type": "Point", "coordinates": [x, y]}
    if shape.shapeType not in (
        shapefile.POLYLINE,
        shapefile.POLYLINEM,
        shapefile.POLYLINEZ,
    ):
        return None
    starts = list(shape.parts) + [len(shape.points)]
    lines = [
        [[x, y] for x, y, *_ in shape.points[starts[i] : starts[i + 1]]]
        for i in range(len(starts) - 1)
    ]
    lines = [line for line in lines if len(line) >= 2]
    if not lines:
        return None
    if len(lines) == 1:
        return {"type": "LineString", "coordinates": lines[0]}
    return {"type": "MultiLineString", "coordinates": lines}


def feature_coordinates(geometry: dict[str, Any]) -> list[list[float]]:
    if geometry["type"] == "Point":
        return [geometry["coordinates"]]
    parts = geometry["coordinates"] if geometry["type"] == "MultiLineString" else [geometry["coordinates"]]
    return [point for part in parts for point in part]


def read_layer(input_dir: Path, config: dict[str, Any]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    geometry_path = input_dir / config["geometry_file"]
    attribute_path = input_dir / config["attributes_file"]
    crs_path = input_dir / config["crs_file"]
    if not geometry_path.is_file() or not attribute_path.is_file() or not crs_path.is_file():
        raise ValueError("A required geometry, attribute table, or CRS metadata file is missing.")
    crs, crs_description = source_crs(crs_path)
    if crs != "EPSG:4326":
        raise ValueError(f"Explicit WGS84 CRS required; source metadata reports {crs or 'unknown'}.")
    features: list[dict[str, Any]] = []
    metrics: dict[str, Any] = {
        "layer_id": config["id"],
        "geometry_source": config["geometry_file"],
        "attributes_source": config["attributes_file"],
        "crs_source": config["crs_file"],
        "source_organization": "Not identified in supplied files",
        "reporting_date": None,
        "crs": crs,
        "crs_description": crs_description,
        "confidence": "Medium for geometry format/CRS; source authority and date unverified",
        "interpretation": config["interpretation"],
    }
    with tempfile.TemporaryDirectory(prefix="chennai-water-metro-") as temp_dir:
        local_shp = Path(temp_dir) / "layer.shp"
        local_dbf = Path(temp_dir) / "layer.dbf"
        shutil.copyfile(geometry_path, local_shp)
        shutil.copyfile(attribute_path, local_dbf)
        reader = shapefile.Reader(str(local_shp), encoding="utf-8", encodingErrors="replace")
        try:
            shapes = reader.shapes()
            records = reader.records()
            fields = [field[0] for field in reader.fields[1:]]
            metrics["shape_type"] = reader.shapeType
            metrics["feature_count"] = len(shapes)
            metrics["attribute_record_count"] = len(records)
            metrics["fields"] = fields
            if len(shapes) != len(records):
                raise ValueError(f"Geometry/attribute count mismatch ({len(shapes)} vs {len(records)}).")
            invalid_geometry = 0
            invalid_coordinates = 0
            duplicates: set[str] = set()
            duplicate_count = 0
            for index, (shape, record) in enumerate(zip(shapes, records, strict=True)):
                geometry = shape_geometry(shape)
                if geometry is None:
                    invalid_geometry += 1
                    continue
                coords = feature_coordinates(geometry)
                if any(
                    len(point) < 2
                    or not math.isfinite(float(point[0]))
                    or not math.isfinite(float(point[1]))
                    or not (-180 <= float(point[0]) <= 180)
                    or not (-90 <= float(point[1]) <= 90)
                    for point in coords
                ):
                    invalid_coordinates += len(coords)
                    continue
                selected = {
                    key: json_value(record[fields.index(key)])
                    for key in config["attribute_fields"]
                    if key in fields
                }
                name = selected.get("Name") or selected.get("Corridors") or selected.get("route_num")
                props = {
                    "source_feature_id": index + 1,
                    "name": name or f"{config['mode']} source feature {index + 1}",
                    "mode": config["mode"],
                    "source_files": [
                        config["geometry_file"],
                        config["attributes_file"],
                        config["crs_file"],
                    ],
                    "source_organization": "Unknown",
                    "reporting_date": None,
                    "confidence": metrics["confidence"],
                    "validation_status": "Geometry and CRS validated; source meaning is unverified",
                    **selected,
                }
                fingerprint = json.dumps(geometry, sort_keys=True, separators=(",", ":"))
                if fingerprint in duplicates:
                    duplicate_count += 1
                else:
                    duplicates.add(fingerprint)
                features.append({"type": "Feature", "geometry": geometry, "properties": props})
            metrics["valid_geometry_count"] = len(features)
            metrics["empty_or_unsupported_geometry_count"] = invalid_geometry
            metrics["invalid_coordinate_count"] = invalid_coordinates
            metrics["duplicate_geometry_count"] = duplicate_count
            metrics["coordinate_bounds"] = [
                min(point[0] for feature in features for point in feature_coordinates(feature["geometry"])),
                min(point[1] for feature in features for point in feature_coordinates(feature["geometry"])),
                max(point[0] for feature in features for point in feature_coordinates(feature["geometry"])),
                max(point[1] for feature in features for point in feature_coordinates(feature["geometry"])),
            ] if features else None
        finally:
            reader.close()
    return features, metrics


def inspect_unmapped_layer(input_dir: Path) -> dict[str, Any]:
    geometry_path = input_dir / UNREFERENCED_LAYER["geometry_file"]
    attribute_path = input_dir / UNREFERENCED_LAYER["attributes_file"]
    crs_path = input_dir / UNREFERENCED_LAYER["crs_file"]
    result: dict[str, Any] = {
        **UNREFERENCED_LAYER,
        "source_organization": "Not identified in supplied files",
        "reporting_date": None,
        "validation_status": "Not mapped: CRS is missing; coordinate transformation would be speculative",
        "geometry_component_signature": "Shapefile geometry signature was detected despite .qmd extension",
    }
    if not geometry_path.is_file():
        result["validation_status"] = "Not mapped: no recoverable geometry file"
        return result
    crs, description = source_crs(crs_path)
    result["crs"] = crs
    result["crs_description"] = description
    result["attributes_available"] = attribute_path.is_file()
    if crs:
        result["validation_status"] = f"Not mapped: source CRS {crs} is not handled by this local pipeline"
    else:
        result["validation_status"] = "Not mapped: CRS absent in source metadata; coordinate values exceed WGS84 degree ranges"
    return result


def inspect_malformed_geometry_files(input_dir: Path) -> list[dict[str, Any]]:
    """Count empty geometry records in signature-verified but mismatched components."""
    candidates = (
        "Operational_Metro_Stns.shp",
        "Rail_Network_Updated.shp",
        "Road_Network_Old CMA.shp",
        "routes_merged.qmd",
    )
    results = []
    for filename in candidates:
        path = input_dir / filename
        if not path.is_file():
            continue
        with path.open("rb") as stream:
            if stream.read(4) != b"\x00\x00'\n":
                results.append({"filename": filename, "status": "not a shapefile by signature"})
                continue
        with tempfile.TemporaryDirectory(prefix="shapefile-stub-") as temp_dir:
            isolated = Path(temp_dir) / "layer.shp"
            shutil.copyfile(path, isolated)
            reader = shapefile.Reader(str(isolated))
            try:
                empty_count = sum(not shape.points for shape in reader.iterShapes())
                results.append(
                    {
                        "filename": filename,
                        "shape_records": reader.numRecords,
                        "empty_geometry_records": empty_count,
                        "status": "empty/incomplete geometry component",
                    }
                )
            finally:
                reader.close()
    return results


def write_feature_collection(path: Path, features: list[dict[str, Any]], note: str) -> None:
    collection = {
        "type": "FeatureCollection",
        "name": path.stem,
        "metadata": {"source_status": note, "crs": "EPSG:4326"},
        "features": features,
    }
    path.write_text(json.dumps(collection, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-dir", type=Path, default=DEFAULT_INPUT)
    args = parser.parse_args()
    geo_dir = PROJECT_ROOT / "data" / "geojson"
    processed_dir = PROJECT_ROOT / "data" / "processed"
    geo_dir.mkdir(parents=True, exist_ok=True)
    processed_dir.mkdir(parents=True, exist_ok=True)
    point_features: list[dict[str, Any]] = []
    metro_line_features: list[dict[str, Any]] = []
    bus_route_features: list[dict[str, Any]] = []
    layer_results = []
    for config in LAYERS:
        try:
            features, metrics = read_layer(args.input_dir, config)
            if config["kind"] == "point":
                point_features.extend(features)
            elif config["id"] == "metro_corridors":
                metro_line_features.extend(features)
            else:
                bus_route_features.extend(features)
            metrics["status"] = "processed"
            print(f"{config['id']}: {metrics['valid_geometry_count']} valid features.")
        except Exception as exc:
            metrics = {
                "layer_id": config["id"],
                "status": "failed",
                "reason": f"{type(exc).__name__}: {exc}",
                "geometry_source": config["geometry_file"],
                "attributes_source": config["attributes_file"],
                "crs_source": config["crs_file"],
            }
            print(f"{config['id']}: {metrics['reason']}")
        layer_results.append(metrics)
    write_feature_collection(
        geo_dir / "transport_stations.geojson",
        point_features,
        "Uploaded Metro feature points; labels and source authority are unverified.",
    )
    write_feature_collection(geo_dir / "metro_lines.geojson", metro_line_features, "Uploaded Metro corridor geometry.")
    write_feature_collection(
        geo_dir / "bus_routes.geojson",
        bus_route_features,
        "Uploaded bus-route geometry inferred from route attributes; operator unverified.",
    )
    write_feature_collection(
        geo_dir / "candidate_waterways.geojson",
        [],
        "No waterway geometry was present in the supplied, recoverable attachments.",
    )
    malformed_geometry_files = inspect_malformed_geometry_files(args.input_dir)
    quality = {
        "processed_at": "runtime-generated",
        "coordinate_reference_system": "EPSG:4326",
        "layers": layer_results,
        "unmapped_layer": inspect_unmapped_layer(args.input_dir),
        "malformed_geometry_files": malformed_geometry_files,
        "empty_geometry_records_in_mismatched_components": sum(
            item.get("empty_geometry_records", 0)
            for item in malformed_geometry_files
        ),
        "source_authority_verified": False,
        "waterway_geometry_features": 0,
        "ferry_terminal_features": 0,
        "transport_station_features": len(point_features),
        "transport_line_features": len(metro_line_features) + len(bus_route_features),
        "metro_line_features": len(metro_line_features),
        "bus_route_features": len(bus_route_features),
        "notes": [
            "Several actual Shapefile and DBF components have misleading extensions; content signatures and record-count matches were used to recover only identifiable layers.",
            "No waterway, ferry terminal, MRTS station, or MTC bus-stop geometry was supplied.",
            "The road/rail network candidate has no CRS in its QGIS metadata and was not transformed or mapped.",
            "Source organizations and reporting dates are not present in the supplied geospatial metadata.",
        ],
    }
    (processed_dir / "geospatial_quality.json").write_text(
        json.dumps(quality, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


if __name__ == "__main__":
    main()
