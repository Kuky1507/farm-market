# Submission guide: repository link and hosted project link

The submission form asks for two links:

1. **Repository Link**: a GitHub page holding the code.
2. **Hosted Project link** (required): a public web address where the running app can be opened.

Everything below is free. Allow about 45 minutes the first time. Do the parts in order,
because Part C needs the result of Part A and Part B.

---

## Part A: Put the code on GitHub (Repository Link)

The project is already a git repository on your computer with one commit. You only need to
create an empty repository on GitHub and push to it.

1. Go to https://github.com and sign in (or click **Sign up** and create an account with your email).
2. Click the **+** at the top right, then **New repository**.
3. Fill in:
   - Repository name: `farm-market`
   - Description: `FarmMarket: MongoDB database connecting Ugandan farmers to buyers`
   - Visibility: **Public** (so the lecturer can open it without logging in)
   - Leave **Add a README**, **.gitignore** and **license** unticked. The project already has them.
4. Click **Create repository**. GitHub shows a page with commands. Ignore them and use the ones below.
5. Open PowerShell in the project folder and run these three commands one at a time.
   Replace `YOUR-USERNAME` with your GitHub username.

   ```powershell
   cd C:\Users\Kuky\Desktop\farm_market_app\farm-market
   ```
   ```powershell
   git remote add origin https://github.com/YOUR-USERNAME/farm-market.git
   ```
   ```powershell
   git push -u origin main
   ```

6. A window will pop up asking you to sign in to GitHub. Choose **Sign in with your browser**
   and approve. The push then completes.
7. Refresh the GitHub page. You should see the folders `backend`, `frontend`, `requirements`
   and the README displayed underneath.

**Repository Link to paste in the form:** `https://github.com/YOUR-USERNAME/farm-market`

---

## Part B: Put the database online with MongoDB Atlas

The hosted app cannot reach the MongoDB on your laptop, so the data must live in the cloud.
MongoDB Atlas gives a free cluster.

1. Go to https://www.mongodb.com/cloud/atlas/register and create an account (or sign in).
2. When asked to deploy a cluster, choose the **Free** (M0) tier. Pick any provider and the
   region closest to you (for example AWS, Frankfurt or Cape Town). Click **Create Deployment**.
3. A box appears to create a database user.
   - Username: `farmmarket`
   - Password: click **Autogenerate** and **copy the password somewhere safe**. You need it twice.
   - Click **Create Database User**.
4. Click **Choose a connection method** then **Drivers**. Copy the connection string. It looks like:
   `mongodb+srv://farmmarket:<db_password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
5. Edit the string:
   - Replace `<db_password>` with the password you copied.
   - Add the database name `farm_market` after the host, before the `?`. The result looks like:
   `mongodb+srv://farmmarket:YOURPASSWORD@cluster0.xxxxx.mongodb.net/farm_market?retryWrites=true&w=majority`
   Keep this string. It is your **MONGODB_URI**.
6. Allow connections from anywhere (needed so the hosting server can reach the database):
   in the left menu click **Network Access**, then **Add IP Address**, then
   **Allow access from anywhere** (0.0.0.0/0), then **Confirm**.
7. Load the 50 sample documents into Atlas from your laptop. In PowerShell:

   ```powershell
   cd C:\Users\Kuky\Desktop\farm_market_app\farm-market\backend
   ```
   ```powershell
   $env:MONGODB_URI = "PASTE-YOUR-MONGODB_URI-HERE"; node seed.js
   ```

   You should see the table with farmers 10, produce_listings 12, buyers 8, orders 10,
   market_prices 10, total 50.
8. Check in Atlas: click **Database**, then **Browse Collections**. The `farm_market` database
   with five collections should be there.

---

## Part C: Host the app on Render (Hosted Project link)

Render runs the Node.js server for free and gives it a public web address.

1. Go to https://render.com and click **Get Started**. Sign up with **GitHub** (easiest, it
   links your repository automatically).
2. On the dashboard click **New +** then **Blueprint**.
3. Connect your GitHub account if asked, then pick the `farm-market` repository and click **Connect**.
4. Render reads the `render.yaml` file in the repository and shows one service called
   `farm-market`. It asks for the value of **MONGODB_URI**: paste the connection string from
   Part B step 5. Click **Apply** (or **Deploy Blueprint**).
5. Wait 2 to 4 minutes. The log should end with
   `MongoDB connected: mongodb+srv://farmmarket:***@...` and `FarmMarket running at ...`.
6. At the top of the service page there is a link like `https://farm-market-xxxx.onrender.com`.
   Click it. The FarmMarket dashboard should open with 50 records.

**Hosted Project link to paste in the form:** that `https://farm-market-xxxx.onrender.com` address.

Note: on the free plan the server sleeps after 15 minutes without visitors. The first visit
after that takes about 30 to 60 seconds to wake up. Open the link yourself a minute before the
lecturer looks at it, or before you present.

If the Blueprint option does not appear, do it manually: **New +** > **Web Service** > pick the
repository, then set Root Directory `backend`, Build Command `npm install`, Start Command
`npm start`, Instance Type **Free**, and under Environment Variables add `MONGODB_URI` with
your connection string. Click **Deploy Web Service**.

---

## Part D: Fill in the form

1. Open the form link the lecturer shared on WhatsApp (docs.google.com/forms/...).
2. **Repository Link:** `https://github.com/YOUR-USERNAME/farm-market`
3. **Hosted Project link:** `https://farm-market-xxxx.onrender.com`
4. Fill any other fields (name, registration number 25/BIT/BU/R/1001) and click **Submit**.

Before you submit, open both links in a private browser window to make sure they work
without being logged in.

---

## If something goes wrong

| Problem | What to do |
|---------|-----------|
| `git push` says "permission denied" or asks for a password | Use the browser sign-in window. If it keeps failing, install GitHub Desktop (https://desktop.github.com), open the folder with **File > Add local repository**, and click **Publish repository**. |
| Render log says "Could not connect to MongoDB" | Check MONGODB_URI: the password must have no `<` `>` around it, and Network Access in Atlas must allow 0.0.0.0/0. |
| Render log says "bad auth" | The password in the URI is wrong. In Atlas go to **Database Access**, edit the user, set a new password, and update MONGODB_URI in Render's **Environment** tab. |
| The site opens but shows 0 records | Part B step 7 was not run, or it was run against the local database. Run it again with `$env:MONGODB_URI` set to the Atlas string. |
| The site is very slow the first time | Normal on the free plan. Wait a minute and refresh. |
| Need to update the code later | Edit the files, then run `git add -A`, `git commit -m "describe the change"`, `git push`. Render redeploys automatically. |
