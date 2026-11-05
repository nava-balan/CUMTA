# Data inventory

Processed: 2026-11-05T23:47:13+05:30

Original attachments remain in the user-provided temporary attachment directory and were not copied into the repository. The import pipeline uses the explicit `--input-dir` path; no other temporary-directory files are scanned. Source organization is recorded as unknown unless present in the file.

## Categories

- **1. Chennai waterways:** No uploaded waterway source geometry or attribute table was recoverable.
- **2. River and canal geometry:** No Buckingham Canal, Ennore Creek, Cooum, Adyar, or Muttukadu geometry was supplied.
- **3. Proposed ferry terminals:** No sourced ferry terminal records were supplied; existing map catchments remain illustrative assumptions.
- **4. Existing Metro network:** Recovered 51 source-labelled Metro point features and 4 Metro corridor features; generic labels, authority, and date are unverified.
- **5. MRTS network:** No separate MRTS line or station dataset was identified.
- **6. Suburban railway network:** A 53-feature rail-attributed candidate layer was found, but its CRS is missing; it was not transformed or mapped.
- **7. MTC bus network:** Recovered 1,348 route geometries and matching route attributes from mislabeled files; bus mode is inferred, and MTC/operator attribution is unverified.
- **8. Population and demographics:** No population or demographic datasets were supplied.
- **9. Traffic and congestion:** No traffic, travel-time, or congestion datasets were supplied.
- **10. Passenger demand:** Ticket archives were aggregated by date and hour. Operator/mode is unverified; aggregates are not Water Metro demand.
- **11. Environmental conditions:** No water-quality, habitat, or environmental monitoring dataset was supplied.
- **12. Waterway navigability:** No bathymetry, depth, bridge-clearance, tidal, or navigability dataset was supplied.
- **13. Solar and electricity infrastructure:** No solar, charging, grid-capacity, or electricity-emissions-factor dataset was supplied.
- **14. Ferry operations:** No vessel, schedule, terminal-capacity, or operational dataset was supplied.
- **15. Financial and revenue assumptions:** The file named PT Fare Structure.pdf is a route attribute DBF, not a PDF or fare schedule. Existing financial values remain editable assumptions.

## Uploaded files inspected

Total: **58** files. Observed ticket date span, including flagged pre-2000 dates: **1970-01-01 to 2026-04-01**.

| Filename | Detected content | Size (bytes) | Subject / processing status |
|---|---|---:|---|
| `Operational_Metro.cpg` | bzip2-compressed CSV | 20,276,421 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Operational_Metro.dbf` | bzip2-compressed CSV | 25,928,518 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Operational_Metro.prj` | bzip2-compressed CSV | 23,711,409 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Operational_Metro.shx` | text or unknown | 5 | text content; format requires inspection |
| `Operational_Metro_Stns.cpg` | dBASE attribute table | 1,314 | DBF signature verified; 4 records |
| `Operational_Metro_Stns.dbf` | WKT coordinate reference system | 145 | WKT signature verified |
| `Operational_Metro_Stns.prj` | QGIS XML metadata | 3,252 | XML content; may not match the filename extension |
| `Operational_Metro_Stns.qmd` | ESRI Shapefile geometry | 152,876 | shapefile signature verified |
| `Operational_Metro_Stns.shp` | ESRI Shapefile geometry | 132 | shapefile signature verified |
| `Operational_Metro_Stns.shx` | text or unknown | 5 | text content; format requires inspection |
| `PT Fare Structure.pdf` | dBASE attribute table | 449,110 | DBF signature verified; 1348 records |
| `Rail_Network_Updated.cpg` | WKT coordinate reference system | 145 | WKT signature verified |
| `Rail_Network_Updated.dbf` | binary or unknown | 7,520 | content does not match a supported text signature |
| `Rail_Network_Updated.prj` | QGIS XML metadata | 1,622 | XML content; may not match the filename extension |
| `Rail_Network_Updated.qmd` | ESRI Shapefile geometry | 8,780,132 | shapefile signature verified |
| `Rail_Network_Updated.shp` | ESRI Shapefile geometry | 10,884 | shapefile signature verified |
| `Rail_Network_Updated.shx` | PDF | 116,879 | PDF signature verified |
| `Readme.txt` | UTF-8 text | 5 | text signature verified |
| `Road_Network_Old CMA.cpg` | dBASE attribute table | 10,361 | DBF signature verified; 53 records |
| `Road_Network_Old CMA.dbf` | WKT coordinate reference system | 401 | WKT signature verified |
| `Road_Network_Old CMA.prj` | QGIS XML metadata | 2,974 | XML content; may not match the filename extension |
| `Road_Network_Old CMA.qmd` | ESRI Shapefile geometry | 49,356 | shapefile signature verified |
| `Road_Network_Old CMA.shp` | ESRI Shapefile geometry | 524 | shapefile signature verified |
| `Road_Network_Old CMA.shx` | QGIS XML metadata | 11,694 | XML content; may not match the filename extension |
| `routes_merged.cpg` | dBASE attribute table | 70,951 | DBF signature verified; 51 records |
| `routes_merged.dbf` | WKT coordinate reference system | 145 | WKT signature verified |
| `routes_merged.prj` | QGIS XML metadata | 1,624 | XML content; may not match the filename extension |
| `routes_merged.qix` | ESRI Shapefile geometry | 1,936 | shapefile signature verified |
| `routes_merged.qmd` | ESRI Shapefile geometry | 508 | shapefile signature verified |
| `routes_merged.shx` | text or unknown | 5 | text content; format requires inspection |
| `Ticket-Data-2026-03-04.csv.bz2` | bzip2-compressed CSV | 20,163,660 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-05.csv.bz2` | bzip2-compressed CSV | 26,089,644 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-06.csv.bz2` | bzip2-compressed CSV | 24,713,597 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-07.csv.bz2` | bzip2-compressed CSV | 24,917,730 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-08.csv.bz2` | bzip2-compressed CSV | 24,977,838 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-09.csv.bz2` | bzip2-compressed CSV | 25,077,318 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-10.csv.bz2` | bzip2-compressed CSV | 24,463,873 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-11.csv.bz2` | bzip2-compressed CSV | 20,373,487 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-12.csv.bz2` | bzip2-compressed CSV | 26,102,816 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-13.csv.bz2` | bzip2-compressed CSV | 25,809,329 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-14.csv.bz2` | bzip2-compressed CSV | 25,405,512 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-15.csv.bz2` | bzip2-compressed CSV | 25,287,606 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-16.csv.bz2` | bzip2-compressed CSV | 25,571,112 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-17.csv.bz2` | bzip2-compressed CSV | 24,163,448 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-18.csv.bz2` | bzip2-compressed CSV | 20,608,387 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-19.csv.bz2` | bzip2-compressed CSV | 26,488,399 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-20.csv.bz2` | bzip2-compressed CSV | 25,375,991 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-21.csv.bz2` | bzip2-compressed CSV | 25,559,033 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-22.csv.bz2` | bzip2-compressed CSV | 23,003,050 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-23.csv.bz2` | bzip2-compressed CSV | 24,862,010 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-24.csv.bz2` | bzip2-compressed CSV | 22,634,853 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-25.csv.bz2` | bzip2-compressed CSV | 20,380,257 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-26.csv.bz2` | bzip2-compressed CSV | 26,636,950 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-27.csv.bz2` | bzip2-compressed CSV | 25,764,395 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-28.csv.bz2` | bzip2-compressed CSV | 25,021,970 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-29.csv.bz2` | bzip2-compressed CSV | 25,182,843 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-30.csv.bz2` | bzip2-compressed CSV | 25,350,480 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |
| `Ticket-Data-2026-03-31.csv.bz2` | bzip2-compressed CSV | 24,430,972 | Ticket CSV schema only; date/hour/passenger/fare aggregates processed. Ticket, employee, payment, device, route, and stop identifiers excluded. |

## Geospatial datasets and validation

| Layer | Inputs | Coverage / fields | CRS | Status |
|---|---|---|---|---|
| metro_station_points | `routes_merged.qix`, `routes_merged.cpg`, `routes_merged.prj` | 51 features; fields: id, Name, descriptio, timestamp, begin, end, altitudeMo, tessellate, extrude, visibility, drawOrder, icon | EPSG:4326 | processed |
| metro_corridors | `Operational_Metro_Stns.qmd`, `Operational_Metro_Stns.cpg`, `Operational_Metro_Stns.prj` | 4 features; fields: id, Corridors, Phasing, Prop_Mode, Identifer, Length | EPSG:4326 | processed |
| bus_routes | `Rail_Network_Updated.qmd`, `PT Fare Structure.pdf`, `Rail_Network_Updated.prj` | 1348 features; fields: route_num, source, destinat, route_id, poly_idx, Corridor | EPSG:4326 | processed |

Unmapped layer: `Road_Network_Old CMA.qmd` — Not mapped: CRS absent in source metadata; coordinate values exceed WGS84 degree ranges.

The 51 Metro points have generic Phase 1 corridor/sequence labels, not verified station names. The 1,348 route features have route number and source/destination attributes; bus mode is inferred, but the operator and reporting date are not identified. No waterway line was supplied.

## Attachment and format caveats

- Several files are mislabeled: `.qmd`/`.qix` contain Shapefile geometry; `.cpg` contains dBASE tables or compressed CSV; three `Operational_Metro.*` files are compressed ticket CSV exports.
- `PT Fare Structure.pdf` has a dBASE attribute-table signature and matches the 1,348 route geometry records. It contains route attributes, not fares; it was not treated as a PDF.
- Shapefile components were matched by content and record counts, not assumed from suffixes. Mismatched/empty sidecars were excluded.
- Geographic coverage of valid WGS84 layers is the coordinate extent in the processed GeoJSON, not an administrative boundary. A route line is not a ferry route.

## Ticket schema and use

Validated aggregate records: **67,943,937** across 31 archives; summed passenger count: **77,382,796**. The source organization and transport mode are unknown. These are sample ticketing data, not Water Metro ridership. Hourly buckets below 20 records are suppressed.

Raw ticket rows and identifier values are not copied to the repository or database. Only daily and thresholded all-days hourly aggregates are retained.
