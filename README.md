# GreenCards — Frontend

This is the GreenCards storefront + admin panel, rebuilt from the original
CreenCart frontend to run against the real `ecommerce-backend` API instead
of fake/local data.

## What changed from the original CreenCart frontend

- **Rebranded** to GreenCards (title, footer, navbar wordmark).
- **Every API call is real.** All five contexts (`ClientAuthContext`,
  `CartContext`, `ProductContext`, `OrderContext`, `SellerAuthContext`) were
  rewritten to call your actual backend endpoints — see `src/api/` for the
  full list of calls and the shapes they expect.
- **Auth** is cookie-based (httpOnly JWT), matching the backend exactly,
  including the two-step register → email OTP → verify flow, and automatic
  silent token refresh on 401s.
- **Cart** is now server-side (`/api/v1/cart`) instead of localStorage.
- **Checkout** places real orders via `/api/v1/orders`, with a real Razorpay
  Checkout popup for online payments and a direct COD path.
- **"Seller" panel → Admin panel.** Important: your backend has **no
  separate "seller" role** — only `user`, `admin`, and `superadmin`. The
  Seller section of the app (dashboard, inventory, add product, orders,
  analytics) now logs in through the same `/users/login` endpoint and just
  requires the account to have `admin` or `superadmin` role. New admin
  accounts can't self-register — that's intentional, matching how your
  backend is built. To get an admin account:
  1. Register a normal account from the storefront.
  2. Have an existing superadmin promote it via
     `PATCH /api/v1/superadmin/users/:userId/role`.
- **Every page from the original app is present**, including `Contact`,
  which existed in the source but wasn't wired into the router — it now
  has a route at `/contact`.
- **Added Framer Motion** for page-transition animations (client + seller
  layouts), plus entrance/hover animations on the homepage banner,
  categories grid, and product cards.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:

```
VITE_API_URL=http://localhost:8000/api/v1   # wherever your backend runs
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx      # same key_id as your backend's Razorpay account
```

On the **backend**, make sure `CORS_ORIGIN` in its `.env` matches wherever
this frontend runs (e.g. `http://localhost:5173` for `npm run dev`), since
requests are sent with `credentials: true` for the cookie-based auth to
work.

```bash
npm run dev       # start the dev server
npm run build     # production build
```

## Project structure

```
src/
  api/            — one file per resource, talks to the real backend
  context/        — React contexts, now backed by src/api/ instead of fake data
  Client/         — storefront pages & components (Home, Cart, Orders, etc.)
  Seller/         — admin panel pages & components (mapped onto admin/superadmin)
  assets/         — images, icons
```

## Known simplifications / things to review before production

- `SalesAnalytics.jsx`'s "sales channel" breakdown (website/mobile/market/
  agent) is randomly simulated — your backend doesn't track order channel,
  so this is cosmetic only. Everything else on that page (revenue, top
  products, categories) is computed from real order data.
- `ManageInventory`'s stock "toggle" sets stock to 0 (off) or 10 (on) as a
  simple default, since the backend has no separate boolean in-stock flag —
  it derives availability from the numeric stock count. Adjust the
  restore-quantity default in `ManageInventory.jsx` if 10 isn't right for
  your catalog.
- `AddProduct.jsx` creates simple (non-variant) products. Your backend also
  supports richer `colorVariants` (color + size + per-size stock) on the
  Product model — if you need to manage those from the UI, that form would
  need extending; `src/api/products.api.js` already exposes
  `addColorVariantImages` for that endpoint.
