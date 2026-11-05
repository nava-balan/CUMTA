# Data quality report

Processed: 2026-11-05T23:47:13+05:30

## Summary

- Total supplied files inspected: **58**
- Ticket records aggregated: **67,943,937**
- Passenger-count sum from uploaded tickets: **77,382,796** (source mode/operator unverified; not Water Metro demand)
- Potential pre-2000 ticket-date outliers retained for review: **4 records** across 1970-01-01
- Valid WGS84 GeoJSON features: **1,403**
- Invalid GeoJSON features in processed outputs: **0**
- Empty geometry records in mismatched shapefile components: **7**
- Duplicate ticket IDs detected within source archives: **0**
- Exact duplicate compressed archives skipped: **0**
- Duplicate source geometries: **13**
- Imported database records across tables: **1518**

## Validation results

- WGS84 point and line coordinate ranges: validated for 1,403 exported features; no output feature has a missing or out-of-range coordinate.
- GeoJSON checks: 4 collections; 0 invalid features.
- Geometry/attribute record counts were matched before importing source layers.
- Metro source metadata explicitly states EPSG:4326; route and corridor records are tagged with unverified authority/date.
- The source railway layer has an empty CRS definition and projected-looking coordinates; it was not transformed or mapped.
- No waterway, ferry terminal, dedicated MRTS, dedicated suburban-station, bus-stop, demographic, congestion, environmental, navigability, solar, fleet, schedule, or validated fare records were found.

## Ticket aggregate quality

- Invalid record/field counts: `{}`
- Missing required values: `{}`
- Files not processed: `[]`
- Pre-2000 ticket dates are reported as potential source anomalies; they are retained in the aggregates and not silently corrected or excluded.
- Identifiers are hashed with a per-run random key held in memory only for within-file duplicate counting; duplicate IDs across different archives are not checked.
- The resulting JSON and SQLite tables contain daily and thresholded all-days hourly sums only; there are no station, route, payment, or ticket-level aggregates.

## Conflicts and rejected interpretation

- `PT Fare Structure.pdf` is actually a dBASE table; its 1,348 route records align with `Rail_Network_Updated.qmd`. The fields are route metadata, not fares.
- The `Rail_Network_Updated` source's route attributes resemble bus services (route number and origin/destination), while the file name suggests rail. The processed layer is labelled **Bus route (mode inferred)**; operator attribution is unresolved.
- `Operational_Metro.cpg`, `.dbf`, and `.prj` are compressed CSVs with a ticket schema, not Metro shapefile sidecars. They are treated as ticket inputs only after header verification.
- No conflicting verified fare, demand, or waterway measurements were present. Unverified sources are not used to resolve official values.

## Imports and remaining requirements

- Local SQLite import: verified; foreign-key check passed.
- Supabase: not configured; no credentials were present in the project configuration.
- PDF text extraction: no actual PDF signature was found for the file named `PT Fare Structure.pdf`; its DBF route attributes were recovered, and no fare schedule was imported.
- Waterways, ferry stations, ferry routes, environmental data, and source-verified transfer stations remain empty/unavailable. Existing demo-only catchments and assumptions remain explicitly illustrative.
- Additional sources needed: authoritative EPSG-tagged waterway centerlines, surveyed candidate terminal coordinates, official Metro/MRTS/suburban/bus stop layers with station names, dated source metadata, valid fare schedules, and approved environmental/navigability studies.

## GeoJSON verification

| File | Feature count | Valid | Invalid |
|---|---:|---:|---:|
| `data\geojson\transport_stations.geojson` | 51 | 51 | 0 |
| `data\geojson\metro_lines.geojson` | 4 | 4 | 0 |
| `data\geojson\bus_routes.geojson` | 1,348 | 1,348 | 0 |
| `data\geojson\candidate_waterways.geojson` | 0 | 0 | 0 |
