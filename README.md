# CHENNAI 360 — One City. Infinite Possibilities.

**Chennai Urban Mobility Authority (CUMTA) Integrated Smart Mobility Platform**

Built from scratch as an interactive, production-grade web application for the Urban Mobility Hackathon.

Deliverables:
1. **Modular React 18 + TypeScript + Tailwind CSS + Vite Application** (`src/`)
2. **Self-Contained, Zero-Dependency Standalone Preview** (`standalone-preview.html`) openable directly in any web browser.

---

## Strict UI/UX & Visual Design Constraints (Production-Grade)

- **Solid Colors Only:** Zero linear gradients, zero radial gradients, zero `backdrop-blur`, and zero translucent glassmorphism anywhere in the application.
- **Zero Emojis:** No emojis anywhere—not in the UI, not in buttons, not in map toggles, not in toasts, and not in copy. Clean vector SVG icons (`lucide-react`) and plain text labels only.
- **Typography:** Strictly **Inter** (600/700 weight) for headings and **JetBrains Mono** / **Inter** (400/500 weight) for body and tabular data. No neon glow text.
- **Strict Spacing Scale:** Fixed scale of `4px`, `8px`, `16px`, or `32px` (`p-1`, `p-2`, `p-4`, `p-8`, `gap-1`, `gap-2`, `gap-4`, `gap-8`, `m-1`, `m-2`, `m-4`, `m-8`).
- **Border Radius & Shadows:** No rounded corners past `8px` (`rounded` or `rounded-lg`) unless it is a full pill button (`rounded-full`). One subtle elevation shadow on cards (`0 1px 3px rgba(0,0,0,0.2)`).
- **Strict Button Hierarchy:** Strictly TWO button variants:
  - **One Primary solid style** (colored background, high-contrast text)
  - **One Secondary style** (solid surface background, 1px solid border).
- **Zero Unjustified Decorative Animations:** Only functional geospatial movement (100ms live ferry coordinate interpolation and smooth camera panning).

---

## Brand Architecture & Solid Color Palettes

When switching between modules via the top navigation bar, the application dynamically applies that module's dedicated solid color palette:

### 1. CHENNAI 360 (Main Portal & TRANSITPULSE Command Center)
- **Tagline:** One City. Infinite Possibilities.
- **Primary Accent:** Royal Blue (`#3A86FF`)
- **Background Primary:** Midnight Navy (`#0B132B`)
- **Surface / Cards:** Deep Slate (`#1C2541`)
- **Secondary Accent:** Electric Cyan (`#00D4FF`)
- **Text / Foreground:** Cloud White (`#F8FAFC`)

### 2. WATERLINK (Phase 1 — Water Metro Module)
- **Primary Identity:** Ocean Teal (`#075B66`)
- **Background Primary:** Deep Ocean (`#042F40`)
- **Surface / Cards:** Ocean Teal (`#075B66`)
- **Primary Button / Interactive Accent:** Aqua (`#00A6A6`)
- **Secondary Highlight / Active State:** Mint (`#48D6C5`)
- **Text / Foreground:** Ice White (`#E8FFFA`)

### 3. ROADWATCH (Phase 2 — Pothole & Civic Hazard Detector)
- **Primary Identity:** Safety Orange (`#FF6B00`)
- **Background Primary:** Carbon Black (`#171717`)
- **Surface / Cards:** Graphite (`#303030`)
- **Primary Button / Interactive Accent:** Safety Orange (`#FF6B00`)
- **Secondary Highlight / Warning State:** Alert Yellow (`#FFC145`)
- **Text / Foreground:** Warm White (`#FFF8ED`)

---

## Mapping Engine & Live Telemetry (Google Maps — Zero API Key)

Leaflet 1.9.4 instances configured to use Google Maps Tile Servers with subdomains `['mt0', 'mt1', 'mt2', 'mt3']` and maxZoom 20:
- **Google Streets URL:** `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}`
- **Google Hybrid Satellite URL:** `https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}`

### 3-Mode Map Layer Switcher (Top-Right Corner)
Solid-colored control group (`rounded-lg`, `p-1`, `gap-1`) with 3 text-only pill buttons (zero emojis):
- **`Dark Map` (Default):** Google Streets (`lyrs=m`) with CSS filter `invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)` applied strictly to `.leaflet-tile-pane`.
- **`Street Map`:** Google Streets (`lyrs=m`) with `filter: none`.
- **`Satellite`:** Google Hybrid (`lyrs=y`) with `filter: none`.

---

## Module 1: WATERLINK (Phase 1 — Water Metro)

- **Interactive 6-Route Waterway Network Map:**
  1. *Route 1 — Adyar River Corridor* (Purple Line | `#A855F7`)
  2. *Route 2 — Cooum River Corridor* (Red Line | `#EF4444`)
  3. *Route 3 — Kovalam Basin & IT Express* (Pink Line | `#EC4899`)
  4. *Route 4 — Buckingham Canal Spine* (Green Line | `#22C55E`)
  5. *Route 5 — Kosasthalaiyar River Corridor* (Burgundy Line | `#9F1239`)
  6. *Route 6 — Coastal Heritage Express: Marina to Mahabalipuram* (Yellow Line | `#EAB308`)
- **12 Live Moving Ferries (100ms Smooth Coordinate Interpolation):**
  - 2 battery-electric vessels per corridor smoothly moving in real time.
  - Bottom telemetry strip using solid `#075B66` cards (`p-4`, `rounded-lg`) displaying Vessel ID, Speed (Knots), Battery SoC (%), Solar Charge (kW), Occupancy.
  - Clicking any ferry card smoothly pans and zooms (`flyTo`) the map camera directly to that vessel.
- **Ticket Zone & Journey Planner:**
  - Origin/Destination stations, Vessel Class (*Eco-Catamaran* vs *Business Hydrofoil*), passenger count, "Redeem Civic Points" checkbox.
  - Comparison & Fare Summary: Base Fare, Points Discount, Final Ticket Price (₹), Water Transit Time vs Road Traffic Time, Minutes Saved, and Departures.
  - Single Primary CTA button (`#00A6A6`): `Book WaterLink Ticket`.
  - SVG QR Code Boarding Pass popup with ticket payload.
- **Tidal & Bridge Clearance Bar:**
  - Real-time Bay of Bengal tidal level and bridge clearances for Napier Bridge, MRTS Bridge Adyar, and Ennore Creek.

---

## Module 2: ROADWATCH (Phase 2 — Hazard Detector)

- **10-Category Civic Hazard Reporting Studio:**
  1. Potholes
  2. Broken Road Surfaces
  3. Waterlogging
  4. Damaged Manholes
  5. Damaged Traffic Signals
  6. Illegal Parking
  7. Road Obstruction
  8. Damaged Pedestrian Footpaths
  9. Missing Road Signs
  10. Street Light Failures
- **Submission Form:** Photo selector/presets, clickable Google Map live coordinate lock, auto ISO timestamp, auto GCC Municipal Zone (Zones 1–15), Severity selector (`Low`, `Medium`, `High`, `Critical`), description, and Primary CTA button (`#FF6B00`): `Submit Hazard Report`.
- **50-Meter Spatial De-Duplication & Automatic Severity Escalation:**
  - Haversine distance calculation within 50 meters of existing active hazard of the same category.
  - Displays solid `#303030` notification banner with `#FFC145` border: *"Issue already reported in this sector. Report forwarded to Admin and severity escalated for priority municipal action."*
  - Increments duplicate count (`+1`), escalates severity (`Medium` → `High` → `Critical`), and credits **+15 Civic Points**.
- **Two-Tier Verification Pipeline:**
  - *Tier 1 (AI Verification):* AI Confidence Score (%) and Expected Repair Time (Hours).
  - *Tier 2 (Municipal On-Spot Verification):* Routed to nearest GCC Ward office. Verified on the spot in TRANSITPULSE to award **+100 Civic Points**.
- **Public Transport Driver Broadcast & Bus Detour Route:**
  - High/Critical road hazards trigger a solid `#FF6B00` top alert bar for MTC bus drivers.
  - Plots solid danger radius circle plus dashed `#48D6C5` Suggested Bus Detour Route on Google Map.

---

## Module 3: TRANSITPULSE (Command Center)

- **Executive Metrics Row:** Solid `#1C2541` cards (`p-4`, `rounded-lg`) displaying:
  - Total Revenue Generated (₹)
  - Total Passengers Travelled
  - Days in Operation
  - Active Fleet Status (12 / 12 Ferries)
  - Total Verified Hazards
- **GCC Municipal Verification Queue:** Tabular data table with a single action button per row: `Verify On-Spot (+100 Pts)` that verifies road hazards and credits +100 Civic Points to the commuter.
- **Live Ticket Ledger:** Real-time ledger of all issued WaterLink tickets with boarding status.

---

## Judge Demo Toolkit

Clean solid-colored pill button (`rounded-full`, `#3A86FF` background, `#F8FAFC` text, zero emojis) in the bottom-right corner labeled `Judge Demo Controls`:
1. **`Test Duplicate Pothole (Saidapet)`** — Switches to ROADWATCH, invalidates map size after 150ms, flies Google Maps to `[13.0213, 80.2231]`, triggers 50m duplicate merger, and escalates severity to Critical (+15 pts).
2. **`Test MTC Driver Detour (T. Nagar)`** — Switches to ROADWATCH, invalidates map size after 150ms, flies Google Maps to `[13.0418, 80.2341]`, plots danger zone and bus detour route, and activates MTC driver alert bar.
3. **`Test WaterLink Ticket & Ledger`** — Switches to WATERLINK, books Saidapet to Srinivasapuram ticket, displays QR boarding pass, and increments Total Revenue and Passengers in TRANSITPULSE.

---

## How to Run

### Instant Preview (Zero Dependencies)
Double-click `standalone-preview.html` to open the complete interactive platform directly in any web browser (Chrome, Edge, Firefox, Safari).

### Development Server
```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Build production bundle
npm run build
```
