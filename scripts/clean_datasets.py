"""Aggregate uploaded ticket exports without saving any trip-level records."""

from __future__ import annotations

import argparse
import bz2
import csv
import hashlib
import json
import math
import re
import secrets
from collections import Counter
from datetime import date, datetime, time
from functools import lru_cache
from pathlib import Path
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = Path.home() / "AppData" / "Local" / "Temp"
TICKET_NAME = re.compile(r"Ticket-Data-2026-03-\d+\.csv\.bz2$", re.IGNORECASE)
MISLABELED_TICKET_FILES = {
    "Operational_Metro.cpg",
    "Operational_Metro.dbf",
    "Operational_Metro.prj",
}
REQUIRED_FIELDS = {"date", "time", "passenger_count", "total_ticket_amount"}
IDENTIFIER_COLUMNS = {
    "id",
    "ticket_no",
    "driver_no",
    "conductor_no",
    "waybill_no",
    "schedule_no",
    "device_serial_number",
    "pine_labs_transaction_no",
    "merchant_id",
    "rrn_number",
    "terminal_id",
}
MIN_BUCKET_RECORDS = 20


def is_ticket_archive(path: Path) -> bool:
    if not TICKET_NAME.fullmatch(path.name) and path.name not in MISLABELED_TICKET_FILES:
        return False
    try:
        with bz2.open(path, "rt", encoding="utf-8-sig", errors="strict", newline="") as stream:
            header = next(csv.reader(stream), [])
        return REQUIRED_FIELDS.issubset({name.strip() for name in header})
    except (OSError, EOFError, UnicodeError, csv.Error):
        return False


@lru_cache(maxsize=4096)
def parse_date(value: str) -> str | None:
    value = value.strip()
    if not value:
        return None
    try:
        return date.fromisoformat(value[:10]).isoformat()
    except ValueError:
        pass
    for pattern in ("%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y", "%Y/%m/%d", "%d-%b-%Y"):
        try:
            return datetime.strptime(value, pattern).date().isoformat()
        except ValueError:
            continue
    return None


@lru_cache(maxsize=65536)
def parse_hour(value: str) -> int | None:
    value = value.strip()
    if not value:
        return None
    try:
        return time.fromisoformat(value).hour
    except ValueError:
        pass
    for pattern in ("%I:%M %p", "%I:%M:%S %p", "%H:%M", "%H:%M:%S"):
        try:
            return datetime.strptime(value, pattern).hour
        except ValueError:
            continue
    return None


def parse_nonnegative(value: str) -> float | None:
    try:
        number = float(value.strip())
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) and number >= 0 else None


def digest_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def process_archives(paths: list[Path], output: Path) -> dict[str, object]:
    daily: dict[str, dict[str, float | int]] = {}
    hourly = [dict(ticket_records=0, passenger_count=0, gross_amount=0.0) for _ in range(24)]
    missing = Counter()
    invalid = Counter()
    failures: list[dict[str, str]] = []
    seen_archives: set[str] = set()
    processed_files: list[dict[str, object]] = []
    total_rows = 0
    valid_id_rows = 0
    duplicate_ids = 0
    salt = secrets.token_bytes(32)
    for path in paths:
        try:
            digest = digest_file(path)
            if digest in seen_archives:
                processed_files.append({"filename": path.name, "status": "duplicate archive skipped"})
                continue
            seen_archives.add(digest)
            seen_ticket_ids: set[bytes] = set()
            with bz2.open(path, "rt", encoding="utf-8-sig", errors="replace", newline="") as stream:
                reader = csv.reader(stream)
                header = next(reader, [])
                normalized = [name.strip().lower() for name in header]
                if not REQUIRED_FIELDS.issubset(normalized):
                    failures.append({"filename": path.name, "reason": "Required date/time/passenger/fare columns are missing."})
                    continue
                positions = {name: normalized.index(name) for name in REQUIRED_FIELDS}
                id_index = normalized.index("id") if "id" in normalized else None
                missing_counts = Counter()
                file_rows = 0
                id_total_before_file = valid_id_rows
                for row in reader:
                    if len(row) != len(header):
                        invalid["wrong_column_count"] += 1
                        continue
                    file_rows += 1
                    total_rows += 1
                    for field_name in REQUIRED_FIELDS:
                        if not row[positions[field_name]].strip():
                            missing_counts[field_name] += 1
                    day = parse_date(row[positions["date"]])
                    hour = parse_hour(row[positions["time"]])
                    passenger_count = parse_nonnegative(row[positions["passenger_count"]])
                    amount = parse_nonnegative(row[positions["total_ticket_amount"]])
                    if day is None:
                        invalid["invalid_dates"] += 1
                    if hour is None:
                        invalid["invalid_times"] += 1
                    if passenger_count is None:
                        invalid["invalid_passenger_counts"] += 1
                    if amount is None:
                        invalid["invalid_ticket_amounts"] += 1
                    if day is not None:
                        group = daily.setdefault(day, {"ticket_records": 0, "passenger_count": 0, "gross_amount": 0.0})
                        group["ticket_records"] += 1
                        if passenger_count is not None:
                            group["passenger_count"] += int(passenger_count)
                        if amount is not None:
                            group["gross_amount"] += amount
                    if hour is not None:
                        group_hour = hourly[hour]
                        group_hour["ticket_records"] += 1
                        if passenger_count is not None:
                            group_hour["passenger_count"] += int(passenger_count)
                        if amount is not None:
                            group_hour["gross_amount"] += amount
                    if id_index is not None:
                        identifier = row[id_index].strip()
                        if identifier:
                            id_hash = hashlib.blake2b(
                                identifier.encode("utf-8"), key=salt, digest_size=16
                            ).digest()
                            if id_hash in seen_ticket_ids:
                                duplicate_ids += 1
                            else:
                                seen_ticket_ids.add(id_hash)
                            valid_id_rows += 1
                file_missing = [name for name in REQUIRED_FIELDS if name not in normalized]
                for name in file_missing:
                    missing[name] += 1
                for name, count in missing_counts.items():
                    missing[name] += count
                processed_files.append(
                    {
                        "filename": path.name,
                        "status": "processed",
                        "records": file_rows,
                        "schema_columns": len(header),
                        "identifier_values_hashed_ephemerally": valid_id_rows - id_total_before_file,
                        "sensitive_identifiers_persisted": False,
                    }
                )
                print(f"Processed {path.name}: {file_rows:,} rows.", flush=True)
        except Exception as exc:
            failures.append({"filename": path.name, "reason": f"{type(exc).__name__}: {exc}"})
            print(f"Failed {path.name}: {type(exc).__name__}: {exc}", flush=True)

    daily_rows = [
        {
            "date": day,
            "ticket_records": stats["ticket_records"],
            "passenger_count": stats["passenger_count"],
            "gross_ticket_amount": round(float(stats["gross_amount"]), 2),
        }
        for day, stats in sorted(daily.items())
    ]
    hourly_rows = []
    for hour, stats in enumerate(hourly):
        suppressed = stats["ticket_records"] < MIN_BUCKET_RECORDS
        hourly_rows.append(
            {
                "hour": hour,
                "ticket_records": None if suppressed else stats["ticket_records"],
                "passenger_count": None if suppressed else stats["passenger_count"],
                "gross_ticket_amount": None if suppressed else round(float(stats["gross_amount"]), 2),
                "suppressed": suppressed,
            }
        )
    passenger_total = sum(int(row["passenger_count"]) for row in daily_rows)
    revenue_total = round(sum(float(row["gross_ticket_amount"]) for row in daily_rows), 2)
    analytics = {
        "metadata": {
            "data_type": "Uploaded ticket transaction aggregates; source transport mode/operator unverified",
            "source_organization": "Unknown",
            "source_files": [entry["filename"] for entry in processed_files if entry["status"] == "processed"],
            "reporting_start": daily_rows[0]["date"] if daily_rows else None,
            "reporting_end": daily_rows[-1]["date"] if daily_rows else None,
            "processed_at": datetime.now().astimezone().isoformat(timespec="seconds"),
            "confidence": "Medium for aggregate arithmetic; low for mode attribution and representativeness",
            "validation_status": "Aggregated; not validated as MTC or Water Metro demand",
            "privacy": "No ticket, employee, payment, device, route, or stop-level identifiers or records are included. Per-archive keyed hashes are used in memory solely to count within-file duplicate ticket IDs; cross-file ID duplicates are not checked. Hourly buckets below the minimum count are suppressed.",
            "minimum_hourly_bucket_records": MIN_BUCKET_RECORDS,
        },
        "totals": {
            "source_files_processed": sum(entry["status"] == "processed" for entry in processed_files),
            "duplicate_archives_skipped": sum(entry["status"] == "duplicate archive skipped" for entry in processed_files),
            "ticket_records": sum(row["ticket_records"] for row in daily_rows),
            "passenger_count": passenger_total,
            "gross_ticket_amount": revenue_total,
            "duplicate_ticket_ids": duplicate_ids,
            "unique_ticket_ids_checked": valid_id_rows - duplicate_ids,
        },
        "daily": daily_rows,
        "hourly": hourly_rows,
        "quality": {
            "invalid_records": sum(invalid.values()),
            "invalid_record_reasons": dict(invalid),
            "missing_required_columns_by_file": dict(missing),
            "failed_files": failures,
            "sensitive_identifier_columns_excluded": sorted(IDENTIFIER_COLUMNS),
        },
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(analytics, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return analytics


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-dir", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=PROJECT_ROOT / "data" / "processed" / "ticket_analytics.json")
    args = parser.parse_args()
    paths = sorted(path for path in args.input_dir.iterdir() if path.is_file() and is_ticket_archive(path))
    if not paths:
        raise SystemExit(f"No ticket CSV archives found in {args.input_dir}")
    print(f"Found {len(paths)} compressed ticket CSV sources; aggregating without saving trip-level data.", flush=True)
    result = process_archives(paths, args.output)
    print(
        f"Complete: {result['totals']['ticket_records']:,} records, "
        f"{result['totals']['duplicate_ticket_ids']:,} duplicate IDs; output {args.output}",
        flush=True,
    )


if __name__ == "__main__":
    main()
