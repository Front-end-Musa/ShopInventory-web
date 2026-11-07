import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const baseURL = process.env.UI_BASE_URL ?? 'http://localhost:4200';
const category = { id: 1, name: 'Food', description: 'Pantry essentials' };
const products = [
  {
    id: 1,
    name: 'Bread',
    sku: 'B1',
    barcode: null,
    description: 'Fresh bread',
    price: 2,
    costPrice: 1,
    categoryId: 1,
    category,
    quantityInStock: 3,
    minimumStockLevel: 5,
  },
  {
    id: 2,
    name: 'Milk',
    sku: 'M1',
    barcode: '123456789012',
    description: null,
    price: 3,
    costPrice: 2,
    categoryId: 1,
    category,
    quantityInStock: 0,
    minimumStockLevel: 2,
  },
];
const analytics = {
  currency: 'USD',
  timezone: 'UTC',
  generatedAt: '2026-11-06T10:00:00Z',
  startDate: '2026-10-07',
  endDate: '2026-11-05',
  availability: {
    inventory: true,
    history: false,
    sales: false,
    salesReason: 'Sales source not connected.',
  },
  inventory: {
    productCount: 2,
    categoryCount: 1,
    inventoryValue: 6,
    inStockCount: 0,
    lowStockCount: 1,
    outOfStockCount: 1,
  },
  sales: { revenue: null, unitsSold: null },
  categories: [{ id: 1, name: 'Food', productCount: 2, quantity: 3, inventoryValue: 6 }],
  lowStockProducts: products,
  daily: [
    { date: '2026-11-04', quantity: null, inventoryValue: null, revenue: null, unitsSold: null },
    { date: '2026-11-05', quantity: 3, inventoryValue: 6, revenue: null, unitsSold: null },
  ],
};
await mkdir('artifacts/ui', { recursive: true });
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const context = await browser.newContext({ ignoreHTTPSErrors: true });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
let failProducts = false,
  empty = false,
  failCategories = false,
  failAnalytics = false,
  failDelete = false;
const requests = [];
await context.route('**/api/**', async (route) => {
  const url = new URL(route.request().url());
  requests.push(url);
  if (route.request().method() === 'DELETE') {
    await route.fulfill({ status: failDelete ? 500 : 204 });
    return;
  }
  if (url.pathname.includes('/analytics/')) {
    await route.fulfill({
      status: failAnalytics ? 503 : 200,
      json: failAnalytics ? {} : analytics,
    });
    return;
  }
  if (url.pathname.includes('/categories')) {
    await route.fulfill({
      status: failCategories ? 503 : 200,
      json: failCategories ? {} : [category],
    });
    return;
  }
  if (url.pathname === '/api/products/999') {
    await route.fulfill({ status: 404, json: {} });
    return;
  }
  if (url.pathname === '/api/products/1') {
    await route.fulfill({ json: products[0] });
    return;
  }
  await route.fulfill({
    status: failProducts ? 503 : 200,
    json: failProducts
      ? {}
      : {
          products: empty ? [] : products,
          totalCount: empty ? 0 : 42,
          totalPages: empty ? 0 : 3,
          page: Number(url.searchParams.get('page') ?? 1),
          pageSize: Number(url.searchParams.get('pageSize') ?? 20),
        },
  });
});
async function audit(name) {
  await page.waitForTimeout(200);
  const result = await new AxeBuilder({ page }).analyze();
  assert.deepEqual(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ target: n.target, reason: n.failureSummary })),
    })),
    [],
    name + ' accessibility',
  );
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    name + ' horizontal overflow',
  );
  await page.screenshot({ path: `artifacts/ui/${name}.png`, fullPage: true });
  console.log('PASS', name);
}
try {
  for (const width of process.env.UI_INTERACTIONS_ONLY ? [] : [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [path, name] of [
      ['/products', 'products'],
      ['/products/new', 'create'],
      ['/products/1/edit', 'edit'],
      ['/products/1', 'details'],
      ['/categories', 'categories'],
      ['/dashboard', 'dashboard'],
      ['/settings', 'settings'],
    ]) {
      console.log('CHECK', width, path);
      await page.goto(baseURL + path);
      await page.getByRole('heading', { level: 1 }).waitFor();
      await page.waitForTimeout(400);
      await audit(`${name}-${width}`);
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(baseURL + '/products');
  await page.getByRole('radio', { name: 'Table view', exact: true }).click();
  await audit('product-table');
  await page.getByRole('button', { name: 'Delete Bread', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  await audit('delete-dialog');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  assert.equal(
    await page
      .getByRole('button', { name: 'Delete Bread', exact: true })
      .evaluate((el) => el === document.activeElement),
    true,
  );
  await page.getByRole('radio', { name: 'Grid view', exact: true }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export page' }).click();
  assert.match((await download).suggestedFilename(), /products-page-1.csv/);
  await page.getByRole('searchbox', { name: 'Search products, SKU' }).fill('Bread');
  await page.waitForTimeout(500);
  assert(requests.some((u) => u.searchParams.get('searchInput') === 'Bread'));
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  assert.equal(await page.locator('#catalog-filters').isVisible(), false);
  await page.getByRole('button', { name: 'Learn more about managing inventory' }).click();
  await audit('help-dialog');
  await page.getByRole('button', { name: 'Got it' }).click();
  failDelete = true;
  await page.getByRole('button', { name: 'Delete Bread', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByRole('alert').waitFor();
  await audit('delete-failed');
  failDelete = false;
  empty = true;
  await page.goto(baseURL + '/products');
  await page.getByText('No products found.', { exact: false }).waitFor();
  await audit('products-empty');
  empty = false;
  failProducts = true;
  failAnalytics = true;
  await page.goto(baseURL + '/products');
  await page.getByRole('button', { name: 'Retry products' }).waitFor();
  await audit('products-error');
  failProducts = false;
  failAnalytics = false;
  await page.goto(baseURL + '/products/999');
  await page.getByText('Product not found.', { exact: false }).waitFor();
  await audit('details-not-found');
  await page.goto(baseURL + '/products/new');
  await page.getByRole('button', { name: 'Save product', exact: true }).click();
  await audit('create-invalid');
  assert.equal(
    await page.getByLabel('Name', { exact: true }).evaluate((el) => el === document.activeElement),
    true,
  );
  failCategories = true;
  await page.goto(baseURL + '/products/new');
  await page.getByRole('button', { name: 'Retry', exact: true }).waitFor();
  await audit('category-error');
  failCategories = false;
  await page.goto(baseURL + '/settings');
  await page.getByRole('combobox', { name: 'Default product view' }).click();
  await page.getByRole('option', { name: 'Table', exact: true }).click();
  await page.getByRole('combobox', { name: 'Products per page' }).click();
  await page.getByRole('option', { name: '50', exact: true }).click();
  await page.goto(baseURL + '/products');
  await page.getByRole('table').waitFor();
  assert(requests.some((u) => u.searchParams.get('pageSize') === '50'));
  assert.deepEqual(errors, [], 'Browser runtime errors');
} catch (error) {
  console.error('PAGE', (await page.locator('body').innerText()).slice(0, 1600), errors);
  throw error;
} finally {
  await browser.close();
}
