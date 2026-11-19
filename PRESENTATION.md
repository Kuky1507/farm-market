# FarmMarket: how to present the project verbally

A step-by-step script. Each section has what to say (in plain words) and what to show on screen.
Aim for about 10 to 12 minutes. Practise once with the app running.

---

## Before you start (5 minutes before the presentation)

1. Make sure MongoDB is running (it runs as a Windows service called "MongoDB", so it normally starts with the computer).
2. Open a terminal and run:
   ```
   cd C:\Users\Kuky\Desktop\farm_market_app\farm-market\backend
   npm install
   npm run seed
   npm start
   ```
   Wait for the two lines `MongoDB connected` and `FarmMarket running at http://localhost:5000`.
3. Open http://localhost:5000 in a browser. Leave it on the Dashboard tab.
4. Optionally open MongoDB Compass, connect to `mongodb://localhost:27017`, and open the `farm_market` database in a second window.
5. Keep the terminal visible. The examiner may want to see the server running.

---

## 1. Introduction (1 minute)

**Say:**
"My project is called FarmMarket. It is a MongoDB database with a web front end that connects smallholder farmers in Uganda directly to buyers such as schools, restaurants, processors and exporters. It is based on the case I submitted in the mid-semester, and I have now built it into a working system that runs MongoDB in the backend and supports all CRUD operations: Create, Read, Update and Delete."

**Show:** the dashboard page.

---

## 2. The problem being solved (1 minute)

**Say:**
"Farmers in Uganda usually sell at the farm gate to middlemen. This causes four problems: the farmer does not know the market price, buyers cannot find reliable supply, records are on paper, and the middlemen keep the margin. FarmMarket stores farmers, their produce listings, buyers, orders and reference market prices in one database, so a farmer can list produce at a fair price, a buyer can search by crop, and every sale is recorded."

---

## 3. Why MongoDB and not a relational database (1 minute)

**Say:**
"I chose MongoDB because the data is not uniform. Every crop has different details: coffee has a grade, moisture and screen size, matooke has a bunch count, tomatoes have ripeness. In MongoDB each listing has an `attributes` sub-document that only holds the fields that apply, so there are no empty columns. Also, an order naturally contains its own items, payment and delivery, so I embed those inside the order document and read the whole order in one step. Some farmers belong to a cooperative or have certifications, others do not, and MongoDB lets me add those fields only where they apply."

**Show:** the Produce listings tab, point at the Attributes column: each row has different attributes.

---

## 4. The database design: five collections (2 minutes)

**Say:**
"The database is called `farm_market` and has five collections."

Go through them one by one, clicking each tab as you speak:

| Tab | What to say |
|-----|-------------|
| Farmers | "One document per registered farmer: name, phone, location as an embedded sub-document, an array of crops grown, farm size, mobile money details. Optional fields like cooperative and certifications appear only on some farmers." |
| Produce listings | "One lot of produce a farmer is selling. It references the farmer by `farmer_id`, and has crop, variety, quantity in kg, price per kg in shillings, harvest date, status, and the crop-specific attributes." |
| Buyers | "Schools, restaurants, market vendors, exporters, processors. Each has a `needs` array of crops they want, so I can find all buyers of beans with one filter." |
| Orders | "One purchase. It references the buyer by `buyer_id` and embeds an array of items, each with the listing id, quantity and unit price. The unit price is saved inside the order, so if the farmer changes the listing price later, old orders are not affected. Payment and delivery are also embedded. Cancelled orders have a cancellation sub-document instead of a delivery." |
| Market prices | "Reference prices of a crop in a market on a date. These are linked to listings by crop using `$lookup`, so I do not store a foreign key." |

**Say about relationships:**
"One farmer has many listings, one buyer has many orders, and orders and listings are many-to-many through the embedded items array. I embed data that is always read with its parent, like order items and a farmer's location, and I reference data that changes on its own and is shared, like farmers, buyers and listings."

---

## 5. The architecture: how the system is built (1.5 minutes)

**Say:**
"The system has three layers.
- The database layer is MongoDB running locally on port 27017.
- The backend is Node.js with Express and Mongoose. Mongoose defines a schema for each collection and talks to MongoDB. Express exposes a REST API: for every collection there are five routes: GET to list, GET by id to read one, POST to create, PUT to update and DELETE to delete.
- The front end is HTML, CSS and JavaScript served by the same Express server. It calls the API with fetch and renders the tables and forms. It never touches the database directly; everything goes through the API."

**Show:** open the terminal and point at the running server. If asked about code, open `backend/server.js` (the routes), `backend/models/index.js` (the schemas) and `frontend/app.js` (the front end).

---

## 6. Live demo of CRUD (3 minutes)

Do these in order. Say the operation name out loud each time.

**CREATE**
1. Click the **Farmers** tab, then **+ Add**.
2. Fill in a name (for example "Demo Farmer"), phone, district, crops "maize, beans", farm size 2.
3. Click **Create**. Point out the toast "F011 created" and the new row.
4. Say: "The server generated the next id automatically and inserted a new document into the farmers collection."

**READ**
1. Type "Mukono" in the search box. Say: "This is a read with a filter. The API runs a case-insensitive regular expression over name, phone, district, cooperative and crops."
2. Clear the search. Click **Produce listings** and change the status filter to "available". Say: "This is a find on crop, status and price, which uses the compound index I created."

**UPDATE**
1. Back on Farmers, click **Edit** on the demo farmer, add a cooperative, click **Save changes**.
2. Say: "This sends a PUT request. Mongoose validates the document and saves it. The cooperative field did not exist before and has now been added, which is the flexible schema."

**UPDATE with $inc (Query 6 from the report)**
1. Click **Produce listings**, click **− stock** on the maize listing L001, type 100.
2. Say: "This runs `updateOne` with `$inc` of minus 100 on `quantity_kg_available`, exactly as in query 6 of my report. The server refuses to go below zero."

**DELETE**
1. Back on Farmers, click **Delete** on the demo farmer and confirm.
2. Say: "This sends a DELETE request and removes the document. If I ask for it again I get a 404."

**Orders (embedded documents)**
1. Click **Orders**, then **+ Add**. Choose a buyer, add one item (listing, quantity), click **Create**.
2. Say: "The server computes each line total and the order total before saving. The items are embedded inside the order document."

---

## 7. The queries and aggregation (2 minutes)

Click the **Dashboard** tab. The cards show the live results in plain language (the MongoDB code itself is in backend/routes/reports.js if the examiner asks to see it).

| Card | What to say |
|------|-------------|
| Affordable maize | "A simple find with a comparison operator: available maize at or below 1,200 shillings per kg, sorted by price." |
| Farmers in a cooperative | "A query with `$exists`: which farmers belong to a cooperative. This only works because the field is optional." |
| Sales per crop | "An aggregation pipeline. `$match` keeps delivered orders, `$unwind` splits each order into one row per item, `$group` sums kilograms and revenue per crop, and `$sort` orders them. This tells a farmer which crops earn the most." |
| Orders and their buyers | "A `$lookup`, which is MongoDB's join. It pulls the buyer's name into each order so I can show a readable report without duplicating the buyer's name in every order." |
| Is the farmer's price fair? | "Another `$lookup`, this time from listings to the latest market price of the same crop, with `$subtract` to compute the difference. This answers the main problem: is the farmer's price fair? Every positive difference means the buyer pays less than the market price." |
| Updating stock after a sale | "The `$inc` stock update you saw in the demo." |

**Say about indexes:**
"I created three indexes: on listings by crop, status and price for the search in query 1; on orders by buyer and date; and on market prices by crop and date for the lookup in query 5."

---

## 8. Proof of robustness (30 seconds)

**Say:**
"The database holds 50 documents: 10 farmers, 12 listings, 8 buyers, 10 orders and 10 market prices. The 28 documents from my report are there unchanged and I added 22 more. The seed script can reload all of them in one command. The API validates input: if I send a listing without a price, I get a 400 error with the message, not a crash. Duplicate ids return a 409."

**Show:** the All records card on the dashboard. If Compass is open, show the same counts there.

---

## 9. Closing (30 seconds)

**Say:**
"To summarise: FarmMarket is a MongoDB database with five collections, designed with embedding and referencing where each suits, and a Node.js API and web front end that perform all CRUD operations plus the aggregation queries from my report. It gives farmers price information, gives buyers a way to find supply, and keeps a record of every sale. Thank you. I am happy to take questions."

---

## Likely questions and short answers

**Why string ids like F001 instead of ObjectId?**
"For readability in the report and in Compass. Mongoose allows `_id` to be a string. The server generates the next one by finding the highest existing id with that prefix."

**What happens if a buyer is deleted but has orders?**
"The orders stay. The lookup in query 4 uses `preserveNullAndEmptyArrays` so the order still shows, labelled unknown buyer. In a production system I would either block the delete or use a soft delete."

**Why embed order items instead of a separate order_items collection?**
"Items are always read with their order and have no meaning alone. Embedding means one read returns the whole order, and the saved unit price is a historical record."

**How does the front end talk to the database?**
"It never does directly. It calls the REST API over HTTP with JSON, and the API uses Mongoose to run queries on MongoDB."

**What is Mongoose?**
"A library for Node.js that lets me define a schema and validation for each collection and gives me methods like find, create, save and aggregate."

**Could this scale?**
"Yes. MongoDB can be hosted on Atlas in the cloud by changing one connection string in the .env file, and the indexes keep the common queries fast as the data grows."

**What would you add next?**
"User login for farmers and buyers, photos on listings, SMS notifications when a listing matches a buyer's needs, and a mobile app on the same API."
