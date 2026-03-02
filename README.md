# Taco Truck Locator

This project is a responsive truck locator application built as a code assessment task.
It displays taco truck locations, allows users to view details, and interact with map and navigation features.

---

## Features

- Location list rendered from API data
- Responsive List / Map view switching
- Static Google Maps rendering per selected location
- Overlay with extended location details
- “Get Directions” opens Google Maps with destination pre-filled
- “View Full Details” opens external location URL
- Dynamic open/closed status calculation
- Handles overnight business hours
- User geolocation support
- Distance calculation using Haversine formula
- Current day highlight in schedule table
- Non-blocking geolocation flow (UI renders immediately)

---

## Technologies Used

- HTML5
- Custom CSS
- jQuery
- Google Maps Static API
- Browser Geolocation API

---

## Implementation Notes

- Centralized state object controls UI rendering
- Rendering logic separated into modular functions
- Defensive checks for missing schedule data
- Business hours are calculated using the America/Los_Angeles timezone to ensure accurate open/closed status
- Distance calculations are added asynchronously after initial render

---

## How to Run

1. Clone the repository
2. Open `index.html` in a browser
3. Allow geolocation access for distance calculation (optional)

---
