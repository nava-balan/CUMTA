"""Load validated local GeoJSON and ticket aggregates into a normalized SQLite fallback."""

from __future__ import annotations

import argparse
import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PROCESSED = PROJECT_ROOT / "data" / "processed"
DATABASE = PROCESSED / "transport.sqlite"

SCHEMA = """
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS data_sources (
    source_id TEXT PRIMARY KEY,
    format TEXT NOT NULL,
    organization TEXT NOT NULL DEFAULT 'Unknown',
    reporting_date TEXT,
    geographic_coverage TEXT NOT NULL DEFAULT 'Unknown',
    confidence TEXT NOT NULL DEFAULT 'Unverified',
    validation_status TEXT NOT NULL,
    source_bytes INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS waterways (
    waterway_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    geometry_geojson TEXT,
    source_id TEXT REFERENCES data_sources(source_id),
    navigability_status TEXT NOT NULL,
    restoration_requirements TEXT,
    feasibility_status TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS ferry_stations (
    station_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    latitude REAL CHECK (latitude BETWEEN -90 AND 90),
    longitude REAL CHECK (longitude BETWEEN -180 AND 180),
    waterway_id TEXT REFERENCES waterways(waterway_id),
    nearby_areas TEXT,
    transport_connections TEXT,
    source_id TEXT REFERENCES data_sources(source_id),
    confidence TEXT NOT NULL,
    feasibility_status TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS transport_stations (
    station_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    transport_type TEXT NOT NULL,
    latitude REAL NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude REAL NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    attributes_json TEXT NOT NULL,
    source_id TEXT REFERENCES data_sources(source_id),
    confidence TEXT NOT NULL,
    validation_status TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS transport_lines (
    line_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    transport_type TEXT NOT NULL,
    geometry_geojson TEXT NOT NULL,
    attributes_json TEXT NOT NULL,
    source_id TEXT REFERENCES data_sources(source_id),
    confidence TEXT NOT NULL,
    validation_status TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS ferry_routes (
    route_id TEXT PRIMARY KEY,
    start_station_id TEXT REFERENCES ferry_stations(station_id),
    end_station_id TEXT REFERENCES ferry_stations(station_id),
    waterway_id TEXT REFERENCES waterways(waterway_id),
    geometry_geojson TEXT,
    distance_km REAL CHECK (distance_km >= 0),
    estimated_travel_minutes REAL CHECK (estimated_travel_minutes >= 0),
    operational_status TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS ticket_daily (
    service_date TEXT PRIMARY KEY,
    ticket_records INTEGER NOT NULL CHECK (ticket_records >= 0),
    passenger_count INTEGER NOT NULL CHECK (passenger_count >= 0),
    gross_ticket_amount REAL NOT NULL CHECK (gross_ticket_amount >= 0)
);
CREATE TABLE IF NOT EXISTS ticket_hourly (
    hour INTEGER PRIMARY KEY CHECK (hour BETWEEN 0 AND 23),
    ticket_records INTEGER CHECK (ticket_records >= 0),
    passenger_count INTEGER CHECK (passenger_count >= 0),
    gross_ticket_amount REAL CHECK (gross_ticket_amount >= 0),
    suppressed INTEGER NOT NULL CHECK (suppressed IN (0, 1))
);
CREATE INDEX IF NOT EXISTS idx_transport_stations_type ON transport_stations(transport_type);
CREATE INDEX IF NOT EXISTS idx_transport_lines_type ON transport_lines(transport_type);
"""


def load_json(path: Path) -> dict[str, Any]:
    if not path.is_file():
        raise FileNotFoundError(f"Required processed dataset is missing: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def source_subject(filename: str) -> str:
    lowered = filename.lower()
    if "ticket-data" in lowered or filename.startswith("Operational_Metro."):
        return "ticket exports; mode and operator unverified"
    if "routes_merged" in lowered or "operational_metro_stns" in lowered:
        return "Metro point/corridor geometry; source authority unverified"
    if "rail_network_updated" in lowered or "pt fare structure" in lowered:
        return "route geometry/attributes; mode inferred, agency unverified"
    if "road_network_old" in lowered:
        return "network layer with missing CRS"
    if "fare" in lowered:
        return "fare data; content validation required"
    return "unclassified source attachment"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--database", type=Path, default=DATABASE)
    args = parser.parse_args()
    source_inventory = load_json(PROCESSED / "source_inventory.json")
    network_quality = load_json(PROCESSED / "geospatial_quality.json")
    ticket_data = load_json(PROCESSED / "ticket_analytics.json")
    point_collection = load_json(PROJECT_ROOT / "data" / "geojson" / "transport_stations.geojson")
    line_collections = [
        load_json(PROJECT_ROOT / "data" / "geojson" / "metro_lines.geojson"),
        load_json(PROJECT_ROOT / "data" / "geojson" / "bus_routes.geojson"),
    ]
    args.database.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(args.database)
    try:
        connection.executescript(SCHEMA)
        with connection:
            for table in (
                "waterways",
                "ferry_stations",
                "transport_stations",
                "transport_lines",
                "ferry_routes",
                "ticket_daily",
                "ticket_hourly",
                "data_sources",
            ):
                connection.execute(f"DELETE FROM {table}")
            for item in source_inventory["files"]:
                filename = item["filename"]
                connection.execute(
                    """INSERT INTO data_sources
                    (source_id, format, organization, reporting_date, geographic_coverage,
                     confidence, validation_status, source_bytes)
                    VALUES (?, ?, 'Unknown', NULL, 'Unknown', 'Unverified', ?, ?)""",
                    (
                        filename,
                        item["format"],
                        source_subject(filename) + "; source organization and date not provided",
                        item["bytes"],
                    ),
                )
            for feature in point_collection["features"]:
                properties = feature["properties"]
                lon, lat = feature["geometry"]["coordinates"][:2]
                source_id = properties["source_files"][0]
                station_id = f"{properties['mode'].lower()}-{properties['source_feature_id']:05d}"
                connection.execute(
                    """INSERT INTO transport_stations
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        station_id,
                        properties["name"],
                        properties["mode"],
                        lat,
                        lon,
                        json.dumps(properties, ensure_ascii=False, separators=(",", ":")),
                        source_id,
                        properties["confidence"],
                        properties["validation_status"],
                    ),
                )
            line_id = 0
            for line_collection in line_collections:
                for feature in line_collection["features"]:
                    line_id += 1
                    properties = feature["properties"]
                    source_id = properties["source_files"][0]
                    connection.execute(
                        """INSERT INTO transport_lines
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                        (
                            f"line-{line_id:05d}",
                            properties["name"],
                            properties["mode"],
                            json.dumps(feature["geometry"], ensure_ascii=False, separators=(",", ":")),
                            json.dumps(properties, ensure_ascii=False, separators=(",", ":")),
                            source_id,
                            properties["confidence"],
                            properties["validation_status"],
                        ),
                    )
            for row in ticket_data["daily"]:
                connection.execute(
                    "INSERT INTO ticket_daily VALUES (?, ?, ?, ?)",
                    (row["date"], row["ticket_records"], row["passenger_count"], row["gross_ticket_amount"]),
                )
            for row in ticket_data["hourly"]:
                connection.execute(
                    "INSERT INTO ticket_hourly VALUES (?, ?, ?, ?, ?)",
                    (
                        row["hour"],
                        row["ticket_records"],
                        row["passenger_count"],
                        row["gross_ticket_amount"],
                        int(row["suppressed"]),
                    ),
                )
        counts = {
            table: connection.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
            for table in (
                "data_sources",
                "waterways",
                "ferry_stations",
                "transport_stations",
                "transport_lines",
                "ferry_routes",
                "ticket_daily",
                "ticket_hourly",
            )
        }
        foreign_key_violations = connection.execute("PRAGMA foreign_key_check").fetchall()
        if foreign_key_violations:
            raise RuntimeError(f"SQLite foreign-key validation failed: {foreign_key_violations[:5]}")
        summary = {
            "database": str(args.database.relative_to(PROJECT_ROOT)),
            "database_mode": "local SQLite; no Supabase credentials/configuration detected",
            "imported_at": datetime.now().astimezone().isoformat(timespec="seconds"),
            "table_counts": counts,
            "foreign_key_violations": len(foreign_key_violations),
            "source_authority_verified": False,
            "waterway_source_features": network_quality["waterway_geometry_features"],
            "note": "Empty waterway, ferry-station, and ferry-route tables are intentional: no validated uploaded records were available.",
        }
        (PROCESSED / "database_import_summary.json").write_text(
            json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )
        print(json.dumps(summary, indent=2))
    finally:
        connection.close()


if __name__ == "__main__":
    main()
