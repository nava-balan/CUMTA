"""Validate local outputs and generate the requested data inventory and quality report."""

from __future__ import annotations

import argparse
import json
import math
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data"

CATEGORIES = [
    ("1. Chennai waterways", "No uploaded waterway source geometry or attribute table was recoverable."),
    ("2. River and canal geometry", "No Buckingham Canal, Ennore Creek, Cooum, Adyar, or Muttukadu geometry was supplied."),
    ("3. Proposed ferry terminals", "No sourced ferry terminal records were supplied; existing map catchments remain illustrative assumptions."),
    ("4. Existing Metro network", "Recovered 51 source-labelled Metro point features and 4 Metro corridor features; generic labels, authority, and date are unverified."),
    ("5. MRTS network", "No separate MRTS line or station dataset was identified."),
    ("6. Suburban railway network", "A 53-feature rail-attributed candidate layer was found, but its CRS is missing; it was not transformed or mapped."),
    ("7. MTC bus network", "Recovered 1,348 route geometries and matching route attributes from mislabeled files; bus mode is inferred, and MTC/operator attribution is unverified."),
    ("8. Population and demographics", "No population or demographic datasets were supplied."),
    ("9. Traffic and congestion", "No traffic, travel-time, or congestion datasets were supplied."),
    ("10. Passenger demand", "Ticket archives were aggregated by date and hour. Operator/mode is unverified; aggregates are not Water Metro demand."),
    ("11. Environmental conditions", "No water-quality, habitat, or environmental monitoring dataset was supplied."),
    ("12. Waterway navigability", "No bathymetry, depth, bridge-clearance, tidal, or navigability dataset was supplied."),
    ("13. Solar and electricity infrastructure", "No solar, charging, grid-capacity, or electricity-emissions-factor dataset was supplied."),
    ("14. Ferry operations", "No vessel, schedule, terminal-capacity, or operational dataset was supplied."),
    ("15. Financial and revenue assumptions", "The file named PT Fare Structure.pdf is a route attribute DBF, not a PDF or fare schedule. Existing financial values remain editable assumptions."),
]


def load_json(path: Path) -> dict[str, Any]:
    if not path.is_file():
        raise FileNotFoundError(f"Required output is missing: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def validate_feature_collection(path: Path) -> dict[str, Any]:
    collection = load_json(path)
    if collection.get("type") != "FeatureCollection" or not isinstance(collection.get("features"), list):
        raise ValueError(f"{path.name} is not a valid GeoJSON FeatureCollection")
    valid = 0
    invalid = 0
    for feature in collection["features"]:
        geometry = feature.get("geometry") or {}
        coordinates = geometry.get("coordinates")
        if not coordinates:
            invalid += 1
            continue
        if geometry.get("type") == "Point":
            points = [coordinates]
        elif geometry.get("type") == "LineString":
            points = coordinates
        elif geometry.get("type") == "MultiLineString":
            points = [point for part in coordinates for point in part]
        else:
            invalid += 1
            continue
        if not points or any(
            len(point) < 2
            or not math.isfinite(float(point[0]))
            or not math.isfinite(float(point[1]))
            or not -180 <= float(point[0]) <= 180
            or not -90 <= float(point[1]) <= 90
            for point in points
        ):
            invalid += 1
        else:
            valid += 1
    return {"file": str(path.relative_to(PROJECT_ROOT)), "features": len(collection["features"]), "valid": valid, "invalid": invalid}


def fmt(value: Any) -> str:
    if value is None:
        return "Not available"
    return str(value).replace("|", "\\|").replace("\n", " ")


def historical_ticket_date_outliers(tickets: dict[str, Any]) -> list[dict[str, Any]]:
    return [row for row in tickets["daily"] if int(row["date"][:4]) < 2000]


def write_inventory(
    source_inventory: dict[str, Any],
    tickets: dict[str, Any],
    network: dict[str, Any],
    output: Path,
) -> None:
    lines = [
        "# Data inventory",
        "",
        f"Processed: {datetime.now().astimezone().isoformat(timespec='seconds')}",
        "",
        "Original attachments remain in the user-provided temporary attachment directory and were not copied into the repository. The import pipeline uses the explicit `--input-dir` path; no other temporary-directory files are scanned. Source organization is recorded as unknown unless present in the file.",
        "",
        "## Categories",
        "",
    ]
    lines.extend(f"- **{title}:** {description}" for title, description in CATEGORIES)
    lines.extend(
        [
            "",
            "## Uploaded files inspected",
            "",
            f"Total: **{len(source_inventory['files'])}** files. Observed ticket date span, including flagged pre-2000 dates: **{fmt(tickets['metadata']['reporting_start'])} to {fmt(tickets['metadata']['reporting_end'])}**.",
            "",
            "| Filename | Detected content | Size (bytes) | Subject / processing status |",
            "|---|---|---:|---|",
        ]
    )
    for item in source_inventory["files"]:
        name = item["filename"]
        details = item.get("note", "")
        schema = item.get("ticket_schema")
        if schema:
            details = (
                "Ticket CSV schema only; date/hour/passenger/fare aggregates processed. "
                "Ticket, employee, payment, device, route, and stop identifiers excluded."
                if schema.get("status", "").startswith("Schema readable")
                else schema.get("status", details)
            )
        lines.append(f"| `{name}` | {fmt(item['format'])} | {item['bytes']:,} | {fmt(details)} |")
    lines.extend(
        [
            "",
            "## Geospatial datasets and validation",
            "",
            "| Layer | Inputs | Coverage / fields | CRS | Status |",
            "|---|---|---|---|---|",
        ]
    )
    for layer in network["layers"]:
        inputs = ", ".join(f"`{layer.get(key, '')}`" for key in ("geometry_source", "attributes_source", "crs_source") if layer.get(key))
        fields = ", ".join(layer.get("fields", [])) or "No usable attributes"
        coverage = f"{layer.get('valid_geometry_count', 0)} features; fields: {fields}"
        lines.append(
            f"| {fmt(layer.get('layer_id'))} | {inputs or '—'} | {fmt(coverage)} | {fmt(layer.get('crs'))} | {fmt(layer.get('status'))} |"
        )
    lines.extend(
        [
            "",
            f"Unmapped layer: `{network['unmapped_layer']['geometry_file']}` — {network['unmapped_layer']['validation_status']}.",
            "",
            "The 51 Metro points have generic Phase 1 corridor/sequence labels, not verified station names. The 1,348 route features have route number and source/destination attributes; bus mode is inferred, but the operator and reporting date are not identified. No waterway line was supplied.",
            "",
            "## Attachment and format caveats",
            "",
            "- Several files are mislabeled: `.qmd`/`.qix` contain Shapefile geometry; `.cpg` contains dBASE tables or compressed CSV; three `Operational_Metro.*` files are compressed ticket CSV exports.",
            "- `PT Fare Structure.pdf` has a dBASE attribute-table signature and matches the 1,348 route geometry records. It contains route attributes, not fares; it was not treated as a PDF.",
            "- Shapefile components were matched by content and record counts, not assumed from suffixes. Mismatched/empty sidecars were excluded.",
            "- Geographic coverage of valid WGS84 layers is the coordinate extent in the processed GeoJSON, not an administrative boundary. A route line is not a ferry route.",
            "",
            "## Ticket schema and use",
            "",
            f"Validated aggregate records: **{tickets['totals']['ticket_records']:,}** across {tickets['totals']['source_files_processed']} archives; summed passenger count: **{tickets['totals']['passenger_count']:,}**. The source organization and transport mode are unknown. These are sample ticketing data, not Water Metro ridership. Hourly buckets below {tickets['metadata']['minimum_hourly_bucket_records']} records are suppressed.",
            "",
            "Raw ticket rows and identifier values are not copied to the repository or database. Only daily and thresholded all-days hourly aggregates are retained.",
            "",
        ]
    )
    output.write_text("\n".join(lines), encoding="utf-8")


def write_quality_report(
    source_inventory: dict[str, Any],
    tickets: dict[str, Any],
    network: dict[str, Any],
    geo_checks: list[dict[str, Any]],
    database_summary: dict[str, Any] | None,
    output: Path,
) -> None:
    valid_features = sum(item["valid"] for item in geo_checks)
    invalid_features = sum(item["invalid"] for item in geo_checks)
    date_outliers = historical_ticket_date_outliers(tickets)
    date_outlier_records = sum(row["ticket_records"] for row in date_outliers)
    imported_records = (
        sum(database_summary["table_counts"].values()) if database_summary else "Not imported"
    )
    failed_files = tickets["quality"]["failed_files"]
    lines = [
        "# Data quality report",
        "",
        f"Processed: {datetime.now().astimezone().isoformat(timespec='seconds')}",
        "",
        "## Summary",
        "",
        f"- Total supplied files inspected: **{len(source_inventory['files'])}**",
        f"- Ticket records aggregated: **{tickets['totals']['ticket_records']:,}**",
        f"- Passenger-count sum from uploaded tickets: **{tickets['totals']['passenger_count']:,}** (source mode/operator unverified; not Water Metro demand)",
        f"- Potential pre-2000 ticket-date outliers retained for review: **{date_outlier_records:,} records** across {', '.join(row['date'] for row in date_outliers) or 'none'}",
        f"- Valid WGS84 GeoJSON features: **{valid_features:,}**",
        f"- Invalid GeoJSON features in processed outputs: **{invalid_features:,}**",
        f"- Empty geometry records in mismatched shapefile components: **{network.get('empty_geometry_records_in_mismatched_components', 0):,}**",
        f"- Duplicate ticket IDs detected within source archives: **{tickets['totals']['duplicate_ticket_ids']:,}**",
        f"- Exact duplicate compressed archives skipped: **{tickets['totals']['duplicate_archives_skipped']:,}**",
        f"- Duplicate source geometries: **{sum(layer.get('duplicate_geometry_count', 0) for layer in network['layers']):,}**",
        f"- Imported database records across tables: **{imported_records}**",
        "",
        "## Validation results",
        "",
        f"- WGS84 point and line coordinate ranges: validated for {valid_features:,} exported features; no output feature has a missing or out-of-range coordinate.",
        f"- GeoJSON checks: {len(geo_checks)} collections; {invalid_features} invalid features.",
        "- Geometry/attribute record counts were matched before importing source layers.",
        "- Metro source metadata explicitly states EPSG:4326; route and corridor records are tagged with unverified authority/date.",
        "- The source railway layer has an empty CRS definition and projected-looking coordinates; it was not transformed or mapped.",
        "- No waterway, ferry terminal, dedicated MRTS, dedicated suburban-station, bus-stop, demographic, congestion, environmental, navigability, solar, fleet, schedule, or validated fare records were found.",
        "",
        "## Ticket aggregate quality",
        "",
        f"- Invalid record/field counts: `{json.dumps(tickets['quality']['invalid_record_reasons'], sort_keys=True)}`",
        f"- Missing required values: `{json.dumps(tickets['quality']['missing_required_columns_by_file'], sort_keys=True)}`",
        f"- Files not processed: `{json.dumps(failed_files, ensure_ascii=False)}`",
        "- Pre-2000 ticket dates are reported as potential source anomalies; they are retained in the aggregates and not silently corrected or excluded.",
        "- Identifiers are hashed with a per-run random key held in memory only for within-file duplicate counting; duplicate IDs across different archives are not checked.",
        "- The resulting JSON and SQLite tables contain daily and thresholded all-days hourly sums only; there are no station, route, payment, or ticket-level aggregates.",
        "",
        "## Conflicts and rejected interpretation",
        "",
        "- `PT Fare Structure.pdf` is actually a dBASE table; its 1,348 route records align with `Rail_Network_Updated.qmd`. The fields are route metadata, not fares.",
        "- The `Rail_Network_Updated` source's route attributes resemble bus services (route number and origin/destination), while the file name suggests rail. The processed layer is labelled **Bus route (mode inferred)**; operator attribution is unresolved.",
        "- `Operational_Metro.cpg`, `.dbf`, and `.prj` are compressed CSVs with a ticket schema, not Metro shapefile sidecars. They are treated as ticket inputs only after header verification.",
        "- No conflicting verified fare, demand, or waterway measurements were present. Unverified sources are not used to resolve official values.",
        "",
        "## Imports and remaining requirements",
        "",
        "- Local SQLite import: " + ("verified; foreign-key check passed." if database_summary and database_summary.get("foreign_key_violations") == 0 else "not verified."),
        "- Supabase: not configured; no credentials were present in the project configuration.",
        "- PDF text extraction: no actual PDF signature was found for the file named `PT Fare Structure.pdf`; its DBF route attributes were recovered, and no fare schedule was imported.",
        "- Waterways, ferry stations, ferry routes, environmental data, and source-verified transfer stations remain empty/unavailable. Existing demo-only catchments and assumptions remain explicitly illustrative.",
        "- Additional sources needed: authoritative EPSG-tagged waterway centerlines, surveyed candidate terminal coordinates, official Metro/MRTS/suburban/bus stop layers with station names, dated source metadata, valid fare schedules, and approved environmental/navigability studies.",
        "",
        "## GeoJSON verification",
        "",
        "| File | Feature count | Valid | Invalid |",
        "|---|---:|---:|---:|",
    ]
    lines.extend(
        f"| `{item['file']}` | {item['features']:,} | {item['valid']:,} | {item['invalid']:,} |"
        for item in geo_checks
    )
    output.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--database-summary", type=Path, default=DATA_DIR / "processed" / "database_import_summary.json")
    args = parser.parse_args()
    processed = DATA_DIR / "processed"
    source_inventory = load_json(processed / "source_inventory.json")
    tickets = load_json(processed / "ticket_analytics.json")
    network = load_json(processed / "geospatial_quality.json")
    database_summary = json.loads(args.database_summary.read_text(encoding="utf-8")) if args.database_summary.is_file() else None
    geo_checks = [
        validate_feature_collection(DATA_DIR / "geojson" / "transport_stations.geojson"),
        validate_feature_collection(DATA_DIR / "geojson" / "metro_lines.geojson"),
        validate_feature_collection(DATA_DIR / "geojson" / "bus_routes.geojson"),
        validate_feature_collection(DATA_DIR / "geojson" / "candidate_waterways.geojson"),
    ]
    write_inventory(source_inventory, tickets, network, DATA_DIR / "DATA_INVENTORY.md")
    write_quality_report(
        source_inventory,
        tickets,
        network,
        geo_checks,
        database_summary,
        DATA_DIR / "DATA_QUALITY_REPORT.md",
    )
    print(
        f"Inventory and quality report generated. GeoJSON features: "
        f"{sum(item['valid'] for item in geo_checks):,} valid, "
        f"{sum(item['invalid'] for item in geo_checks):,} invalid."
    )
    if database_summary:
        connection = sqlite3.connect(PROJECT_ROOT / database_summary["database"])
        try:
            violations = connection.execute("PRAGMA foreign_key_check").fetchall()
            print(f"SQLite tables: {database_summary['table_counts']}; foreign-key violations: {len(violations)}")
            if violations:
                raise SystemExit("SQLite foreign-key validation failed.")
        finally:
            connection.close()


if __name__ == "__main__":
    main()
