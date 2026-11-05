"""Run the complete local attachment inspection and import pipeline."""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PIPELINE = (
    "inspect_data.py",
    "import_documents.py",
    "process_geospatial.py",
    "clean_datasets.py",
    "import_database.py",
    "validate_data.py",
)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-dir", type=Path, default=Path.home() / "AppData" / "Local" / "Temp")
    args = parser.parse_args()
    if not args.input_dir.is_dir():
        raise SystemExit(f"Input directory does not exist: {args.input_dir}")
    for script in PIPELINE:
        command = [sys.executable, str(PROJECT_ROOT / "scripts" / script), "--input-dir", str(args.input_dir)]
        if script in {"import_database.py", "validate_data.py"}:
            command = [sys.executable, str(PROJECT_ROOT / "scripts" / script)]
        print(f"\n==> {script}", flush=True)
        subprocess.run(command, cwd=PROJECT_ROOT, check=True)
    print("\nData import pipeline completed.", flush=True)


if __name__ == "__main__":
    main()
