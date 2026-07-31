# OpenAtlas Feature #2156 - Date Entry Prototype

This repository contains an interactive UI prototype for **OpenAtlas Feature #2156 (Overhaul of Date Entries)**.

## Overview
This single-page application demonstrates a proposed solution for handling date entries in the OpenAtlas application based on CIDOC CRM principles, specifically addressing the challenges of asymmetric dates (termini post/ante quem) without overwhelming general users.

### Key Features
1. **Dual-Mode User Interface:**
   - **Simple View:** For standard dates. Uses OpenAtlas autocomplete logic (e.g. entering "800" automatically expands to `begin_from="800-01-01"` to `begin_to="800-12-31"`).
   - **Advanced (Scientific) View:** For precise control over `begin_from`, `begin_to`, `end_from`, and `end_to`.
2. **Smart Heuristics:** Automatically detects if loaded data contains complex asymmetries and forces the UI into the Advanced View to prevent data loss. Displays a warning if a user attempts to downgrade while holding asymmetric data.
3. **Interactive Presets:** Test predefined theoretical scenarios instantly.
4. **Live Payload Preview:** See the JSON data that would be sent to the backend API in real-time.

## Links
- **Redmine Issue:** [#2156](https://redmine.openatlas.eu/issues/2156)
- **Prototype Hosted via GitHub Pages:** [View Prototype](https://bkoschicek.github.io/openatlas-dates) *(Update link to correct GitHub Pages URL when deployed)*

## Tech Stack
- Vanilla JavaScript (ES6+)
- Bootstrap 5 (via CDN)
- CSS3
- HTML5

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.