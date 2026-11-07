# Inventory and sales analytics

The Material UI includes Dashboard, Products (grid/table), product create/edit/details, Categories, and browser-local display preferences. Existing product/category API payloads are unchanged.

## Run and verify

```sh
npm start
npm test -- --watch=false
npm run build
npx playwright install chromium
npm run test:ui
```

The browser verification uses `http://localhost:4200` (override with `UI_BASE_URL`), intercepts API requests with test fixtures, checks every screen at 1440, 768, and 390 pixels, runs axe including its best-practice rules, checks key interactions, and saves screenshots under ignored `artifacts/ui/`. It does not alter shop data. Unit tests include Material harness coverage.

Production SSR uses explicit local allowed hosts in `angular.json`; add the deployment hostname before deploying. Dynamic product routes render on the server rather than being prerendered.

## Backend setup

The sibling `../ShopInventory-backend/ShopInventory.Api` contains the new endpoint, snapshot worker, and migration. Deploy frontend and backend changes together. From this directory:

```sh
dotnet ef database update --project ../ShopInventory-backend/ShopInventory.Api
dotnet test ../ShopInventory-backend/ShopInventory.Analytics.Tests
dotnet run --project ../ShopInventory-backend/ShopInventory.Api --launch-profile https
```

The additive `InventoryAnalytics` migration was applied to the local development database during implementation. An already-running API process must be restarted to load the new controller. No historical shop data is fabricated or backfilled.

Configure backend settings using the `Analytics` section or environment variables:

- `Analytics__Currency`: ISO currency code, default `USD`, matching the existing product UI.
- `Analytics__Timezone`: reporting timezone ID, default `UTC`.
- `Analytics__SalesFile`: optional absolute path to a normalized JSON export supplied by the shop's sales integration.

The hosted worker captures the closing inventory aggregate at the next business midnight and subsequent midnights while the API is running. Missed days remain unavailable. Snapshots are filtered by currency and timezone so changing reporting configuration does not mix incompatible history. A unique date key prevents duplicate captures across instances; capture failures are logged. Keep one reporting configuration per database.

`GET /api/analytics/overview?days=7|30|90` returns current inventory totals and category/stock breakdowns plus history for the last complete business days. Default range is 30. Invalid ranges return HTTP 400. Stock value is selling price multiplied by quantity; zero-stock products are excluded from the low-stock count. Replenishment lists include both groups.

## Sales integration boundary

No source-system credentials or vendor API were provided. The backend consumes an atomic normalized export; the external integration must generate and replace this file after each completed business day. This is a read-only analytics integration, not a new sales-entry workflow.

```json
{
  "currency": "USD",
  "timezone": "UTC",
  "startDate": "2026-10-07",
  "endDate": "2026-11-05",
  "daily": [
    { "date": "2026-11-05", "revenue": 125.50, "unitsSold": 42 }
  ]
}
```

`startDate` through `endDate` asserts complete coverage. Omitted dates **inside** that range mean zero activity; dates outside it are unavailable. Include only completed days. Revenue must exclude tax and shipping and include returns as signed adjustments. Units sold must likewise be net of returns. The adapter rejects invalid JSON, mismatched currency/timezone, duplicate days, out-of-range days, and coverage including the current day. It reports unavailable data when the file cannot be read.

The dashboard only totals sales when the entire requested range is covered. It can plot available days of a partially covered range without connecting lines across gaps. Inventory CRUD remains available if analytics fails. The catalog's CSV export includes the loaded page, uses CSV escaping, and neutralizes spreadsheet formula prefixes.
