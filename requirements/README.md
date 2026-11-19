# requirements/ folder

Everything needed to install, run, present and submit FarmMarket.

| File | What it is |
|------|------------|
| `SOFTWARE_REQUIREMENTS.md` | Software to install (MongoDB, Compass, Node.js) with download links, versions and how to check them |
| `ASSIGNMENT_BRIEF.md` | The lecturer's instructions and what the mid-sem case asked for |
| `REQUIREMENTS_CHECKLIST.md` | Every requirement, where it is met in the code, and how to demonstrate it |
| `farm_market_case_study.pdf` | The mid-semester case study this project is built on |
| `setup.ps1` | One-time setup: checks requirements, installs libraries, loads the sample data |
| `run.ps1` | Starts the server and opens http://localhost:5000 |
| `data/*.json` | The five collections exported as JSON, ready to import into MongoDB Compass |

## Quick start

Open PowerShell in the `farm-market` folder (the folder that contains `backend`, `frontend` and `requirements`) and run:

```powershell
.\requirements\setup.ps1
```

then

```powershell
.\requirements\run.ps1
```

If PowerShell refuses to run scripts, run this once first:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## Importing the data into Compass instead

1. Open Compass, connect to `mongodb://localhost:27017`.
2. Create database `farm_market` with first collection `farmers`.
3. Open the collection, click **Add Data** -> **Import JSON or CSV file**, choose `data/farmers.json`.
4. Repeat for `produce_listings`, `buyers`, `orders` and `market_prices`.

`npm run seed` does the same thing in one command, so Compass import is only needed if you want to show the manual steps from section 6 of the case study.

## Related documents (one level up)

- `../README.md`: project overview and API reference
- `../PRESENTATION.md`: script for the verbal presentation
