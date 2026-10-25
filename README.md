# Pinservex

Live: **https://pinservex.com**

An IT hardware storefront (~15k products, 163 brands, 16 categories) made up of three parts in this repo:

```
pinservex/
├── Database/     # SQL scripts to create and seed the database
├── HardwareStore/# ASP.NET Core Web API (backend)
└── Frontend/     # React + Vite storefront (frontend)
```

The frontend talks to the backend over `/api`, and the backend talks to SQL Server exclusively through stored procedures. There is no ORM and no migration tool — the database is provisioned by running the scripts in `Database/`.

In production the two halves ship as **one unit**: the React build is copied into the API's `wwwroot/` and a single Azure App Service serves both the SPA and `/api/*`, backed by Azure SQL. Secrets (DB connection string, SMTP password, Turnstile secret) live only in App Service configuration — never in the repo. See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the full Azure walkthrough.

**Stack:** React 19 · Vite · Framer Motion · ASP.NET Core (.NET 10) · Microsoft.Data.SqlClient · MailKit · Cloudflare Turnstile · Azure App Service · Azure SQL

**Author:** Mirza Ramis Baig

---

## Prerequisites

- SQL Server (Developer/Express edition is fine) + a way to run `.sql` scripts (SSMS, Azure Data Studio, `sqlcmd`)
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- Node.js 18+ and npm

## 1. Create the database

Run the two scripts in `Database/` **in order**, against your SQL Server instance:

1. **`Database/Schema+Population.sql`**
   Creates the `HardwareStore` database, the `Category` and `Product` tables (with the `IX_Product_CategoryId` index), and seeds them with the full category/product catalog.
2. **`Database/SPs.sql`**
   Creates the stored procedures the API calls: `usp_Category_GetAll`, `usp_Product_GetByCategory`, `usp_Product_GetById`, `usp_Product_Search`.

In SSMS: open each file, make sure you're connected to the target server, and hit **Execute** — run `Schema+Population.sql` first, then `SPs.sql`.

## 2. Run the backend

The connection string lives in `HardwareStore/appsettings.json`:

```
Server=localhost;Database=HardwareStore;Trusted_Connection=True;Encrypt=True;TrustServerCertificate=True;
```

This assumes SQL Server is reachable at `localhost` using Windows Authentication. If your instance uses a named instance, a different host, or SQL Authentication, update this value first.

```bash
cd HardwareStore
dotnet restore
dotnet run
```

The API starts at `http://localhost:5054` (and `https://localhost:7255` if you use the `https` launch profile). Swagger UI is available at `/swagger` in both Development and Production.

CORS is currently locked to `http://localhost:5173` / `https://localhost:5173` (the frontend's default dev origin) — see `Program.cs` if you run the frontend on a different port.

## 3. Run the frontend

```bash
cd Frontend
npm install
npm run dev
```

The app starts at `http://localhost:5173`. Vite's dev server proxies any `/api/*` request to `http://localhost:5054` (configured in `Frontend/vite.config.js`), so the backend must already be running.

---

## Backend architecture

The API is a straightforward layered ASP.NET Core Web API — no ORM, no MediatR, just constructor-injected interfaces per layer:

```
Controllers  →  Services  →  Repositories  →  SQL Server (stored procedures)
```

| Layer | Responsibility |
|---|---|
| **Controllers** | Parse HTTP input, call a service, map the result to a status code. No business logic. |
| **Services** | Thin pass-through layer between controllers and repositories. Currently 1:1 with repository methods — the seam exists for future business logic (validation, aggregation, caching) without touching controllers or data access. |
| **Repositories** | Own all data access. Open a `SqlConnection`, execute a stored procedure via `Microsoft.Data.SqlClient`, and map `SqlDataReader` rows into DTOs by hand. |
| **DTOs** | `Response/` holds the shapes returned to the frontend (`CategoryResponse`, `ProductResponse`, `ProductListResponse`). `Request/` is currently unused (reserved for future write endpoints). |

### Dependency injection & startup (`Program.cs`)

- Each repository/service interface pair is registered as `Scoped`.
- A CORS policy named `"Frontend"` allows only `http://localhost:5173` / `https://localhost:5173`.
- Swagger (`Swashbuckle`) is always on, at `/swagger`.
- `UseHttpsRedirection()` only runs outside Development, so local HTTP calls aren't redirected.

### Endpoints

| Method | Route | Controller action | Stored procedure |
|---|---|---|---|
| GET | `/api/categories` | `CategoriesController.GetAll` | `usp_Category_GetAll` |
| GET | `/api/categories/{categoryId}/products?pageNumber=` | `CategoriesController.GetProductsByCategory` | `usp_Product_GetByCategory` |
| GET | `/api/products/{productId}` | `ProductsController.GetById` | `usp_Product_GetById` |
| GET | `/api/products/search?q=&categoryId=&pageNumber=` | `ProductsController.Search` | `usp_Product_Search` |

Product listing endpoints (`GetByCategory`, `Search`) return two result sets from the stored procedure: a page of rows (12 per page) and a total count, which the repository stitches into a single `ProductListResponse { Items, TotalCount }`. Both procedures also return a single-column `ErrorCode = -1` result set instead of rows when the category doesn't exist, which the repository detects and turns into `null` → the controller responds `404 Not Found`.

### Data access pattern

Repositories don't use an ORM. Each method:
1. Opens a `SqlConnection` using the `DefaultConnection` string from configuration.
2. Executes a stored procedure (`CommandType.StoredProcedure`) with typed `SqlParameter`s.
3. Reads the `SqlDataReader` results into DTOs by column name (`GetOrdinal`).

This means the database schema and stored procedures in `Database/` are the source of truth — there are no EF Core migrations, so any schema change must be made in the SQL scripts and kept in sync with the repository code by hand.
