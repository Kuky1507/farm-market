# FarmMarket

**Live demo:** https://farm-market-ebxe.onrender.com (free hosting, first load may take up to a minute)
**Repository:** https://github.com/Kuky1507/farm-market

A MongoDB project that connects Ugandan smallholder farmers directly to buyers.
It is the working system behind the mid-semester case study *"FarmMarket: a MongoDB
database that connects Ugandan smallholder farmers directly to buyers"*.

- **Backend:** Node.js, Express, Mongoose, MongoDB (database `farm_market`)
- **Frontend:** HTML, CSS and plain JavaScript, served by the same Express server
- **CRUD:** every collection supports Create, Read (list, search, filter, read one), Update and Delete
- **Data:** 50 seeded documents across the 5 collections (the 28 from the report plus 22 more)

## Collections

| Collection         | Documents | What one document is                                   |
|--------------------|-----------|--------------------------------------------------------|
| `farmers`          | 10        | A registered farmer (optional cooperative, certifications, irrigation) |
| `produce_listings` | 12        | One lot of produce for sale, with crop-specific `attributes` |
| `buyers`           | 8         | A school, restaurant, market vendor, exporter, processor, hotel or hospital |
| `orders`           | 10        | One purchase with embedded `items`, `payment`, `delivery` / `cancellation` |
| `market_prices`    | 10        | A reference price of a crop in a market on a date      |

Relationships: `produce_listings.farmer_id -> farmers._id`, `orders.buyer_id -> buyers._id`,
`orders.items[].listing_id -> produce_listings._id`, and `market_prices` are joined to listings
by `crop` with `$lookup`.

## Requirements

- Node.js 18 or newer
- MongoDB running locally on `mongodb://localhost:27017` (MongoDB Community Server, or Compass's bundled server)

## Run it

```powershell
cd backend
npm install
npm run seed      # loads the 50 sample documents (drops existing data in farm_market first)
npm start         # starts the API + front end on http://localhost:5000
```

Then open **http://localhost:5000** in a browser.

To change the connection string or port, edit `backend/.env`:

```
MONGODB_URI=mongodb://localhost:27017/farm_market
PORT=5000
```

## What the front end does

- **Dashboard:** live document counts and the six queries from section 5 of the report
  (cheap maize, cooperative farmers, sales per crop with `$unwind`/`$group`, orders with
  buyer names via `$lookup`, price fairness via `$lookup` on `market_prices`, and stock
  reduction with `$inc`).
- **Farmers / Produce listings / Buyers / Orders / Market prices:** a table for each
  collection with search, filters, **+ Add** (create), **Edit** (update) and **Delete**.
- **Orders** form: pick a buyer, add one or more items from the listings, and the server
  computes `line_total_ugx` and `total_ugx` automatically.
- **Produce listings:** the **− stock** button runs the `$inc` update from query 6 and
  refuses to go below zero.

## REST API

All endpoints are under `/api`. Each collection has the same five routes:

| Method | Route                          | Action                                         |
|--------|--------------------------------|------------------------------------------------|
| GET    | `/api/<collection>`            | List. Supports `?q=` text search and filters (e.g. `?status=available`, `?crop=maize`, `?type=school`) |
| GET    | `/api/<collection>/:id`        | Read one                                       |
| POST   | `/api/<collection>`            | Create (an id such as `F011` is generated if none is sent) |
| PUT    | `/api/<collection>/:id`        | Update (partial updates are fine)              |
| DELETE | `/api/<collection>/:id`        | Delete                                         |

`<collection>` is one of `farmers`, `listings`, `buyers`, `orders`, `market-prices`.

Report endpoints:

| Route                                        | Report                                   |
|----------------------------------------------|------------------------------------------|
| `GET /api/reports/summary`                   | Counts per collection and delivered revenue |
| `GET /api/reports/cheap-listings?crop=maize&max_price=1200` | Query 1           |
| `GET /api/reports/cooperative-farmers`       | Query 2                                  |
| `GET /api/reports/sales-per-crop`            | Query 3 (`$unwind` + `$group`)           |
| `GET /api/reports/orders-with-buyers`        | Query 4 (`$lookup`)                      |
| `GET /api/reports/price-fairness`            | Query 5 (`$lookup` to latest market price) |
| `POST /api/reports/listings/:id/reduce-stock` with `{ "kg": 100 }` | Query 6 (`$inc`) |
| `GET /api/reports/farmers-by-crop?crop=beans`| Array query on `crops_grown`             |

Example with curl:

```powershell
curl -X POST http://localhost:5000/api/farmers -H "Content-Type: application/json" -d "{\"name\":\"Test Farmer\",\"phone\":\"0700 000 000\",\"location\":{\"district\":\"Jinja\"},\"crops_grown\":[\"maize\"]}"
```

## Project layout

```
farm-market/
  backend/
    server.js          Express app, routes, static front end, error handling
    seed.js            Loads the 50 sample documents and creates the indexes
    export.js          Exports the collections to requirements/data/*.json
    models/index.js    Mongoose schemas for the five collections
    routes/crud.js     Generic CRUD router used by every collection
    routes/reports.js  The coursework queries as API endpoints
    .env               MONGODB_URI and PORT
  frontend/
    index.html, style.css, app.js
  requirements/
    Software list, assignment brief, requirements checklist, setup.ps1, run.ps1,
    the case study PDF and JSON exports of the five collections (see requirements/README.md)
  PRESENTATION.md      Script for the verbal presentation
```

## Indexes created

```
produce_listings: { crop: 1, status: 1, price_per_kg_ugx: 1 }
orders:           { buyer_id: 1, ordered_at: -1 }
market_prices:    { crop: 1, date: -1 }
```

You can also open the same database in MongoDB Compass at `mongodb://localhost:27017`
and browse `farm_market` there; the front end and Compass show the same documents.
