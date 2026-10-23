# Pinservex — Azure Deployment Guide

Everything is packaged. This guide takes you from zero to a live site on Azure.
The app is bundled as **one deployable unit**: the .NET backend serves both the
API (`/api/*`) and the React storefront, so you deploy **one** App Service.

## What's already prepared for you

| File | What it is |
|---|---|
| `pinservex-deploy.zip` | The whole app (backend + built React). Upload this to Azure. |
| `Database/azure/01-schema.sql` | Tables + indexes (Azure-ready — no `CREATE DATABASE`). |
| `Database/azure/02-seed.sql` | All catalog data (16 categories, 163 brands, ~14.9k products). |
| `Database/azure/03-procs.sql` | Stored procedures. |

You provide: an Azure account, and the secret values (DB password, SMTP password)
typed into Azure's settings — **never committed to any file**.

Estimated cost: ~**$10–20/month** (App Service Basic B1 + Azure SQL Basic).
There are free trial credits for the first 30 days.

---

## Step 1 — Create the database (Azure SQL)

1. Go to **portal.azure.com** → search **"SQL databases"** → **Create**.
2. **Create new server**:
   - Server name: e.g. `pinservex-sql` (must be globally unique).
   - Location: closest to your customers (e.g. East US).
   - Authentication: **Use SQL authentication**.
   - Admin login: e.g. `pinservexadmin` — **write it down**.
   - Password: pick a strong one — **write it down**.
3. Database name: **`HardwareStore`**.
4. Compute + storage → **Configure** → choose **Basic** (cheapest) to start.
5. Create. Wait ~2 minutes.
6. Open the SQL **server** (not the database) → **Networking** →
   - Turn ON **"Allow Azure services and resources to access this server"**.
   - Add your current IP (**Add your client IPv4 address**) so you can load data.
   - Save.

## Step 2 — Load the data

Use **Azure Data Studio** (free download) or **sqlcmd** — the portal's query
editor can choke on the 2.5 MB seed file.

Connect to `pinservex-sql.database.windows.net`, database `HardwareStore`, with
the admin login/password. Then run the three scripts **in order**:

1. `Database/azure/01-schema.sql`
2. `Database/azure/02-seed.sql`
3. `Database/azure/03-procs.sql`

(Command-line alternative:)
```
sqlcmd -S pinservex-sql.database.windows.net -d HardwareStore -U pinservexadmin -P "YOURPASSWORD" -i "Database/azure/01-schema.sql"
sqlcmd -S pinservex-sql.database.windows.net -d HardwareStore -U pinservexadmin -P "YOURPASSWORD" -i "Database/azure/02-seed.sql"
sqlcmd -S pinservex-sql.database.windows.net -d HardwareStore -U pinservexadmin -P "YOURPASSWORD" -i "Database/azure/03-procs.sql"
```

## Step 3 — Create the App Service (the web app)

1. Portal → search **"App Services"** → **Create** → **Web App**.
2. Settings:
   - Name: e.g. `pinservex` → your URL becomes `pinservex.azurewebsites.net`.
   - Publish: **Code**.
   - Runtime stack: **.NET 10 (LTS)**.  *(If .NET 10 isn't listed yet, tell me
     and I'll rebuild the zip as a self-contained package that needs no runtime.)*
   - OS: **Linux**. Region: same as the database.
   - Plan: **Basic B1** (create new).
3. Create.

## Step 4 — Configure settings (this is where your secrets go — securely)

App Service → your app → **Settings → Environment variables**.

**Connection strings** tab → **Add**:
- Name: `DefaultConnection`
- Type: **SQLAzure**
- Value:
  ```
  Server=tcp:pinservex-sql.database.windows.net,1433;Database=HardwareStore;User ID=pinservexadmin;Password=YOUR_DB_PASSWORD;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
  ```

**App settings** tab → **Add** each of these (note the **double underscores**):
| Name | Value |
|---|---|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `Email__SmtpHost` | `smtp.hostinger.com` |
| `Email__SmtpPort` | `465` |
| `Email__UseStartTls` | `false` |
| `Email__Username` | `info@pinservex.com` |
| `Email__Password` | *your Hostinger mailbox password* |
| `Email__FromAddress` | `info@pinservex.com` |
| `Email__FromName` | `Pinservex Website` |
| `Email__ToAddress` | `info@pinservex.com` |
| `Turnstile__SecretKey` | *(optional — your Cloudflare secret, if using captcha)* |

Click **Apply / Save** (the app restarts).

## Step 5 — Deploy the app

Easiest (portal): App Service → **Deployment Center** isn't needed for a one-off —
instead use the **Advanced Tools (Kudu)** ZIP push, or the Azure CLI:

**Azure CLI (recommended):** install the Azure CLI, then:
```
az login
az webapp deploy --resource-group <your-resource-group> --name pinservex --src-path pinservex-deploy.zip --type zip
```

That uploads and starts the app.

## Step 6 — Test

Open **https://pinservex.azurewebsites.net**. You should see the storefront with
live products, working filters, and working forms (submit one — it emails
info@pinservex.com). If products don't load, re-check the connection string and
the SQL server firewall ("Allow Azure services" ON).

## Step 7 — Point your domain (pinservex.com)

1. App Service → **Custom domains** → **Add custom domain** → `www.pinservex.com`
   (and/or `pinservex.com`). Azure shows the DNS records to add.
2. In **Hostinger → DNS**, add the CNAME/A records Azure gives you.
   **Leave the MX records alone** — that keeps your email working.
3. Back in Azure, **Add** the domain, then **Add a managed certificate** (free
   HTTPS) and bind it.

Done — your site is live on your own domain with HTTPS.

---

## Updating the site later
Rebuild and redeploy:
1. `cd Frontend && npm run build`
2. copy `Frontend/dist/*` into `HardwareStore/wwwroot/`
3. `cd HardwareStore && dotnet publish -c Release -o ../publish`
4. delete `publish/appsettings.Development.json` (never ship secrets)
5. zip `publish/*` and `az webapp deploy ... --src-path <zip> --type zip`

## Security notes
- No passwords live in any committed file or in the deploy zip. They exist only
  on your machine (`appsettings.Development.json`, gitignored-worthy) and in
  Azure's encrypted settings.
- Azure SQL encrypts data at rest, auto-patches, and firewalls by default.
- Turn on the Cloudflare Turnstile captcha by setting `Turnstile__SecretKey`
  (backend) and rebuilding the frontend with `VITE_TURNSTILE_SITE_KEY` set.
