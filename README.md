# Chennai Water Metro — Concept Demonstrator

A no-build, local web demo for exploring a **proposed** Chennai water transport network. It uses Python's standard library to serve a responsive HTML application; no API keys, package installation, database, or account are required.

## Run locally

From this directory, run:

```powershell
py main.py
```

Then open [http://127.0.0.1:8000](http://127.0.0.1:8000). Set `PORT` or `HOST` environment variables to use a different local address.

The interactive OpenStreetMap view uses Leaflet and map tiles from external services, so that part needs an internet connection. If Leaflet cannot load, the rest of the application remains available and explains the limitation.

## What's included

- Concept network map with candidate catchments, waterway study layers, filters, and station details.
- Deterministic demo journey planner with clearly labelled illustrative times and fares.
- Simulated fleet controls, demand profile, carbon calculator, financial scenarios, and downloadable reports.
- Multimodal concept, terminal ideas, feasibility risks, and a local administrator simulator.
- Editable simulator assumptions saved in the current browser's local storage.

## Important limitations

This is a hackathon concept—not an official transport service. Proposed waterways, approximate map traces and catchment coordinates, interchange opportunities, schedules, demand, emissions, and financial figures are not approved, operational, independently validated, or intended for travel decisions. Map traces are not surveyed channel centerlines or ferry routes; catchment markers are not verified docks. In particular, Cooum and Adyar possibilities are restoration-dependent. Any real proposal requires appropriate agency coordination, engineering and navigability surveys, environmental and safety review, demand validation, and regulatory approvals.

The app is a static local demo. It does not include Supabase, authentication, a shared database, live telemetry, official schedules, real-time routing, or payment/ticketing integration.
