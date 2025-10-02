
Lugvia Rate Calculator API
==========================

This is a starter Node.js Express app that calculates moving rate estimates and includes a platform fee (commission) so Lugvia earns on each forwarded client.

Features:
- /api/calculate : estimate price breakdown. Uses GOOGLE Distance Matrix if GOOGLE_API_KEY is set, otherwise accepts distance_miles in request.
- /api/partners : register partner companies and optional rate overrides
- /api/leads : store leads and chosen partner + pricing info
- Data is stored in data.json for this starter

How to run:
1. Install Node.js (16+)
2. npm install
3. (Optional) export GOOGLE_API_KEY=your_key
4. node server.js
5. Use endpoints per README.

Example /api/calculate request (JSON):
{
  "pickup":"10001, New York, NY",
  "dropoff":"11201, Brooklyn, NY",
  "size":"2br",
  "extras": { "packing": true, "packers": 1, "pack_hours": 2, "heavy_items": 1 }
}

If you don't want to use Google API, pass distance_miles:
{
  "distance_miles": 12.5,
  "size":"1br"
}
