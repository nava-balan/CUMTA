"""Extract text from supplied PDF and plain-text reference documents."""

from __future__ import annotations

import argparse
import csv
import json
import shutil
import tempfile
from pathlib import Path

from pypdf import PdfReader
import shapefile


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = Path.home() / "AppData" / "Local" / "Temp"


def extract_pdf(path: Path) -> tuple[str, dict[str, object]]:
    with path.open("rb") as stream:
        if not stream.read(8).startswith(b"%PDF-"):
            raise ValueError("File content does not have a PDF signature.")
    reader = PdfReader(str(path), strict=False)
    pages = []
    for number, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        pages.append(f"## Page {number}\n\n{text.strip()}")
    metadata = {
        "pages": len(reader.pages),
        "title": (reader.metadata.title or "").strip() if reader.metadata else "",
        "author": (reader.metadata.author or "").strip() if reader.metadata else "",
        "encrypted": reader.is_encrypted,
    }
    return "\n\n".join(pages).strip() + "\n", metadata


def extract_mislabeled_route_table(path: Path, output: Path) -> dict[str, object]:
    with tempfile.TemporaryDirectory(prefix="route-attributes-") as temp_dir:
        dbf_copy = Path(temp_dir) / "routes.dbf"
        shutil.copyfile(path, dbf_copy)
        reader = shapefile.Reader(dbf=str(dbf_copy), encoding="utf-8", encodingErrors="replace")
        try:
            fields = [field[0] for field in reader.fields[1:]]
            allowed = {"route_num", "source", "destinat", "route_id", "poly_idx", "Corridor"}
            if not set(fields).issubset(allowed):
                raise ValueError(f"Unexpected attribute fields; refusing to export: {fields}")
            records = reader.records()
            with output.open("w", encoding="utf-8", newline="") as stream:
                writer = csv.writer(stream)
                writer.writerow(fields)
                writer.writerows(records)
            return {"records": len(records), "fields": fields}
        finally:
            reader.close()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-dir", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output-dir", type=Path, default=PROJECT_ROOT / "data" / "processed" / "documents")
    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    entries = []
    sources = (
        args.input_dir / "PT Fare Structure.pdf",
        args.input_dir / "Readme.txt",
    )
    for path in sources:
        if not path.is_file():
            continue
        entry: dict[str, object] = {
            "filename": path.name,
            "source": "user-supplied local attachment",
            "status": "failed",
        }
        try:
            if path.name == "Readme.txt":
                content = path.read_text(encoding="utf-8-sig")
                output = args.output_dir / "readme.txt"
                output.write_text(content, encoding="utf-8")
                entry.update({"status": "extracted as text", "characters": len(content), "output": str(output.relative_to(PROJECT_ROOT))})
            else:
                with path.open("rb") as stream:
                    signature = stream.read(8)
                if signature.startswith(b"%PDF-"):
                    text, metadata = extract_pdf(path)
                    output = args.output_dir / f"{path.stem}.txt"
                    output.write_text(text, encoding="utf-8")
                    entry.update({"status": "extracted as PDF", "metadata": metadata, "output": str(output.relative_to(PROJECT_ROOT))})
                else:
                    output = args.output_dir / "recovered_route_attributes.csv"
                    metadata = extract_mislabeled_route_table(path, output)
                    entry.update({
                        "status": "recovered as a route attribute table; not a PDF fare schedule",
                        "metadata": metadata,
                        "output": str(output.relative_to(PROJECT_ROOT)),
                    })
            print(f"{path.name}: {entry['status']}.")
        except Exception as exc:
            entry["reason"] = f"{type(exc).__name__}: {exc}"
            print(f"Could not extract {path.name}: {type(exc).__name__}: {exc}")
        entries.append(entry)
    manifest = args.output_dir / "extraction_manifest.json"
    manifest.write_text(json.dumps(entries, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
