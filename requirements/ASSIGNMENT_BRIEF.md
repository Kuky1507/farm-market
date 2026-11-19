# Assignment brief

## Instructions from the lecturer (received by message)

1. "Starting tomorrow you are required to build up a MongoDB project, basing on the case you submitted in the mid sem."
2. "The database should have a front end developed in languages of your choice."
3. "The system should at least be able to execute all CRUD operations, running MongoDB in the backend."

## The mid-semester case

The case is in `farm_market_case_study.pdf` in this folder:
*FarmMarket: a MongoDB database that connects Ugandan smallholder farmers directly to buyers*
by Kukkiriza Elizabeth, registration number 25/BIT/BU/R/1001.

It defines:

- The problem: farmers sell through middlemen without knowing the market price; buyers cannot find supply; records are on paper.
- Five collections in a database called `farm_market`: `farmers`, `produce_listings`, `buyers`, `orders`, `market_prices`.
- 28 sample documents across those collections.
- Six queries (find with comparison, `$exists`, `$unwind` + `$group`, two `$lookup` aggregations, `$inc` update) and two indexes.

## Deliverables of this project

| Deliverable | Where it is |
|-------------|-------------|
| MongoDB database `farm_market` with the five collections | Created by `npm run seed`; JSON copies in `requirements/data/` |
| Backend running MongoDB | `backend/` (Node.js, Express, Mongoose) |
| Front end | `frontend/` (HTML, CSS, JavaScript), served at http://localhost:5000 |
| All CRUD operations | Create, Read, Update, Delete for every collection, through both the API and the front end |
| The six queries from the case | Dashboard page and `backend/routes/reports.js` |
| Sample data (at least 30 entries) | 50 documents, loaded by `backend/seed.js` |
| Documentation | `README.md`, `PRESENTATION.md`, this `requirements/` folder |
