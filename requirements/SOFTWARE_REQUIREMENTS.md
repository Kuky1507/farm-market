# Software requirements

Everything that must be installed on the computer before FarmMarket can run.
All of it is free. Install in the order shown.

| # | Software | Version needed | Why it is needed | Download |
|---|----------|----------------|------------------|----------|
| 1 | **MongoDB Community Server** | 6.0 or newer (8.x recommended) | The database. Runs in the background as the Windows service "MongoDB" on port 27017. | https://www.mongodb.com/try/download/community |
| 2 | **MongoDB Compass** | any recent | Graphical tool to browse the `farm_market` database, import JSON and run MongoSH queries. Bundled with the server installer (tick "Install MongoDB Compass"). | https://www.mongodb.com/try/download/compass |
| 3 | **Node.js** (includes npm) | 18 or newer (LTS recommended) | Runs the Express backend and the seed script. npm installs the libraries. | https://nodejs.org |
| 4 | **A web browser** | any modern browser (Chrome, Edge, Firefox) | Opens the front end at http://localhost:5000 | already installed |
| 5 | **A code editor** (optional) | VS Code recommended | To open and show the source code during the presentation. | https://code.visualstudio.com |

## Node.js libraries (installed automatically by `npm install`)

These are listed in `backend/package.json` and downloaded into `backend/node_modules`.

| Library | Version | Purpose |
|---------|---------|---------|
| express | 4.x | Web server and REST API routes |
| mongoose | 8.x | Schemas, validation and queries on MongoDB |
| cors | 2.x | Lets a browser on another origin call the API |
| dotenv | 16.x | Reads `MONGODB_URI` and `PORT` from `backend/.env` |

No libraries are needed for the front end. It is plain HTML, CSS and JavaScript.

## Hardware

Any laptop made in the last ten years is enough. The database holds 50 documents and uses
under 100 MB of disk including Node.js libraries. No internet connection is needed to run
or present the project once everything is installed.

## How to check each requirement is met

Open PowerShell and run these one at a time. Each should print a version or "Running".

```powershell
node --version
```
```powershell
npm --version
```
```powershell
Get-Service MongoDB
```

If `Get-Service MongoDB` says Stopped, start it with:

```powershell
Start-Service MongoDB
```

If Node.js or MongoDB is not found, install it from the links above and reopen PowerShell.

## Configuration

The only configuration is `backend/.env`:

```
MONGODB_URI=mongodb://localhost:27017/farm_market
PORT=5000
```

Change `MONGODB_URI` if MongoDB runs on another computer or on MongoDB Atlas.
Change `PORT` if 5000 is already used on the machine.
