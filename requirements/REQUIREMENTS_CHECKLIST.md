# Requirements checklist

Each requirement, where it is met in the project, and how to prove it during the presentation.

## A. Lecturer's requirements

| # | Requirement | Met by | How to show it |
|---|-------------|--------|----------------|
| A1 | Project is based on the mid-sem case | Same database name, five collections, field names and 28 documents as the case study PDF | Open the PDF section 4 next to the Farmers tab; the documents match |
| A2 | MongoDB runs in the backend | `backend/server.js` connects with Mongoose to `mongodb://localhost:27017/farm_market` | Terminal prints `MongoDB connected`; Compass shows the same data |
| A3 | A front end in a language of my choice | `frontend/` in HTML, CSS and JavaScript | Open http://localhost:5000 |
| A4 | Create | **+ Add** button on every tab; `POST /api/<collection>` | Add a farmer and show the new row and the toast "F0xx created" |
| A5 | Read | Tables, search box and filters; `GET /api/<collection>` and `GET /api/<collection>/:id` | Search "Mukono" in Farmers; filter listings by status |
| A6 | Update | **Edit** button; `PUT /api/<collection>/:id`; also **− stock** (`$inc`) | Edit a farmer and add a cooperative; reduce stock of L001 |
| A7 | Delete | **Delete** button; `DELETE /api/<collection>/:id` | Delete the test farmer; it disappears from the table |
| A8 | Enough data to prove robustness (30+ entries) | 50 documents loaded by `backend/seed.js` | Dashboard "Total documents" card shows 50; Compass shows the counts |

## B. Requirements from the case study itself

| # | Requirement in the case | Met by | How to show it |
|---|--------------------------|--------|----------------|
| B1 | Five collections: farmers, produce_listings, buyers, orders, market_prices | `backend/models/index.js` | Five tabs in the front end; five collections in Compass |
| B2 | Flexible schema: optional cooperative, certifications, has_irrigation | Schemas use `strict: false`; optional fields | Farmers tab: only some rows show a cooperative or certification tag |
| B3 | Crop-specific `attributes` sub-document | `attributes` is a Mixed field | Produce listings tab, Attributes column differs per row |
| B4 | Orders embed items, payment, delivery or cancellation | `OrderSchema` with embedded `items` array | Orders tab; create an order with two items |
| B5 | Unit price saved with the order | `items[].unit_price_ugx` stored; totals computed on save | Change a listing price, old orders keep their price |
| B6 | References: `farmer_id`, `buyer_id`, `items[].listing_id` | Fields with `ref` in the schemas | Listing rows show the farmer id; orders show the buyer id |
| B7 | Query 1: available maize at or below 1,200/kg | `GET /api/reports/cheap-listings` | Dashboard card 1 |
| B8 | Query 2: farmers in a cooperative (`$exists`) | `GET /api/reports/cooperative-farmers` | Dashboard card 2 |
| B9 | Query 3: sales per crop (`$unwind`, `$group`) | `GET /api/reports/sales-per-crop` | Dashboard card 3 |
| B10 | Query 4: orders with buyer name (`$lookup`) | `GET /api/reports/orders-with-buyers` | Dashboard card 4 |
| B11 | Query 5: price fairness (`$lookup` + `$subtract`) | `GET /api/reports/price-fairness` | Dashboard card 5 |
| B12 | Query 6: reduce stock (`$inc`) | `POST /api/reports/listings/:id/reduce-stock` | **− stock** button on a listing |
| B13 | Indexes on listings and orders | Declared in the schemas, created by `syncIndexes()` in the seed | Compass -> collection -> Indexes tab |
| B14 | Data importable in Compass | `requirements/data/*.json` in Extended JSON | Compass -> Add Data -> Import JSON |

## C. Quality requirements (added for robustness)

| # | Requirement | Met by | How to show it |
|---|-------------|--------|----------------|
| C1 | Input validation | Mongoose required fields, enums and min values; 400 responses with messages | Submit the listing form with no price |
| C2 | Duplicate ids rejected | Unique `_id`; 409 response | Send a POST with an existing `_id` through curl |
| C3 | Auto-generated ids | `nextId()` in `backend/routes/crud.js` | Add a document without typing an id |
| C4 | Totals always consistent | `pre('validate')` hook recalculates line and order totals | Edit an order's quantity, total updates |
| C5 | Stock cannot go negative | Check in the reduce-stock route | Try to reduce L005 by more than available |
| C6 | Reloadable sample data | `npm run seed` drops and reloads all 50 documents | Run it live, counts return to 50 |
| C7 | Documentation | `README.md`, `PRESENTATION.md`, `requirements/` | Open the files |
