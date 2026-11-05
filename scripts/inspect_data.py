"""Inventory source attachments without exposing ticket-level values."""

from __future__ import annotations

import argparse
import bz2
import csv
import json
import re
import struct
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = Path.home() / "AppData" / "Local" / "Temp"
TICKET_PATTERN = re.compile(r"Ticket-Data-2026-03-\d+\.csv\.bz2$", re.IGNORECASE)
SHAPE_BASES = {
    "Operational_Metro",
    "Operational_Metro_Stns",
    "routes_merged",
    "Rail_Network_Updated",
    "Road_Network_Old CMA",
}
SOURCE_NAMES = {
    "PT Fare Structure.pdf",
    "Readme.txt",
}


def identify(path: Path) -> tuple[str, str]:
    """Identify common formats by content as well as by filename."""
    try:
        with path.open("rb") as stream:
            signature = stream.read(16)
    except OSError as exc:
        return "unreadable", str(exc)
    if signature.startswith(b"BZh"):
        if path.name.lower().endswith(".csv.bz2"):
            return "bzip2-compressed CSV", "compression signature verified"
        try:
            with bz2.open(path, "rt", encoding="utf-8-sig", errors="strict", newline="") as stream:
                header = next(csv.reader(stream), [])
            if {"date", "time", "passenger_count", "total_ticket_amount"}.issubset(header):
                return "bzip2-compressed CSV", "CSV content verified; filename extension is mislabeled"
        except (OSError, EOFError, UnicodeError, csv.Error):
            pass
        return "bzip2 stream", "extension does not match content"
    if signature.startswith(b"%PDF-"):
        return "PDF", "PDF signature verified"
    if signature[:4] == b"\x00\x00'\n":
        return "ESRI Shapefile geometry", "shapefile signature verified"
    if signature.startswith((b"GEOGCS[", b"PROJCS[")):
        return "WKT coordinate reference system", "WKT signature verified"
    if len(signature) >= 1 and signature[0] in {0x02, 0x03, 0x04, 0x05, 0x30, 0x31, 0x32, 0x43, 0x63, 0x83, 0x8B, 0xCB, 0xF5, 0xFB}:
        try:
            with path.open("rb") as stream:
                header = stream.read(32)
            if len(header) == 32:
                records = struct.unpack_from("<I", header, 4)[0]
                header_size = struct.unpack_from("<H", header, 8)[0]
                record_size = struct.unpack_from("<H", header, 10)[0]
                if 32 <= header_size <= path.stat().st_size and record_size > 0 and header_size + records * record_size <= path.stat().st_size:
                    return "dBASE attribute table", f"DBF signature verified; {records} records"
        except (OSError, struct.error):
            pass
    if signature.startswith(b"SQLite format 3"):
        return "SQLite database", "SQLite signature verified"
    try:
        text = path.read_text(encoding="utf-8-sig")
    except (OSError, UnicodeError):
        return "binary or unknown", "content does not match a supported text signature"
    stripped = text.lstrip()
    if stripped.startswith(("<?xml", "<!DOCTYPE qgis", "<qgis")):
        return "QGIS XML metadata", "XML content; may not match the filename extension"
    if path.suffix.lower() == ".txt":
        return "UTF-8 text", "text signature verified"
    return "text or unknown", "text content; format requires inspection"


def inspect_ticket(path: Path) -> dict[str, object]:
    """Read only the schema and sample width; never output or persist record values."""
    try:
        with bz2.open(path, "rt", encoding="utf-8-sig", errors="strict", newline="") as stream:
            reader = csv.reader(stream)
            columns = next(reader, [])
            first = next(reader, None)
    except (OSError, EOFError, UnicodeError, csv.Error, StopIteration) as exc:
        return {"columns": [], "status": f"Unreadable: {type(exc).__name__}"}
    sensitive_terms = ("driver", "conductor", "ticket", "waybill", "device", "transaction", "merchant", "rrn", "terminal", "ncmc", "serial")
    sensitive = [column for column in columns if any(term in column.lower() for term in sensitive_terms)]
    return {
        "columns": columns,
        "sample_width_valid": first is None or len(first) == len(columns),
        "sensitive_identifier_columns_excluded": sensitive,
        "status": "Schema readable; record contents intentionally not inventoried",
    }


def shapefile_inventory(input_dir: Path) -> list[dict[str, object]]:
    """Report required sidecars and actual signatures for each supplied layer."""
    entries = []
    for base in sorted(SHAPE_BASES):
        components = {}
        for suffix in (".shp", ".shx", ".dbf", ".prj", ".cpg", ".qix", ".qmd"):
            path = input_dir / f"{base}{suffix}"
            if not path.exists():
                components[suffix] = "missing"
            else:
                kind, note = identify(path)
                components[suffix] = {"kind": kind, "note": note, "bytes": path.stat().st_size}
        required = {key: components[key] for key in (".shp", ".shx", ".dbf", ".prj")}
        entries.append(
            {
                "dataset": base,
                "components": components,
                "required_sidecars_present": all(value != "missing" for value in required.values()),
            }
        )
    return entries


def inspect(input_dir: Path) -> dict[str, object]:
    rows = []
    for path in sorted(input_dir.iterdir()):
        if not path.is_file() or not (
            path.name in SOURCE_NAMES
            or TICKET_PATTERN.fullmatch(path.name)
            or path.stem in SHAPE_BASES
        ):
            continue
        kind, note = identify(path)
        is_ticket = kind == "bzip2-compressed CSV"
        row: dict[str, object] = {
            "filename": path.name,
            "format": kind,
            "bytes": path.stat().st_size,
            "note": note,
        }
        if is_ticket:
            row["ticket_schema"] = inspect_ticket(path)
        rows.append(row)
    return {
        "source_directory_label": "user-supplied local attachment directory",
        "files": rows,
        "shapefile_sets": shapefile_inventory(input_dir),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-dir", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=PROJECT_ROOT / "data" / "processed" / "source_inventory.json")
    args = parser.parse_args()
    if not args.input_dir.is_dir():
        raise SystemExit(f"Input directory does not exist: {args.input_dir}")
    result = inspect(args.input_dir)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Inspected {len(result['files'])} files in the supplied directory.")
    print(f"Inventory: {args.output}")


if __name__ == "__main__":
    main()
