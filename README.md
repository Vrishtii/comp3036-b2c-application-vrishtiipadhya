# crave.

A B2C bakery web application built for COMP3036. Customers can browse, order, and track baked goods. Admins manage products, orders, and customers through a separate dashboard.

**Live:** https://comp3036-b2c-application-vrishtiipa.vercel.app

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Database & Auth | Supabase |
| Deployment | Vercel |
| Testing | Playwright (E2E) |
| CI/CD | GitHub Actions |

---

## Features

### Customer
- Register with name, email, phone, and baked good preferences
- Personalised home page based on preferences
- Browse menu with category filtering and search
- Add items to cart with custom notes (e.g. allergy info)
- Checkout with pickup date/time selection
- View past orders with live status updates
- Edit profile details and preferences
- Change password and delete account

### Admin
- Separate dashboard, never sees customer-facing pages
- Manage all orders — filter by status, date, and order number
- Update order status (pending → confirmed → ready → completed)
- Add, edit, toggle availability, and delete products
- View all customers with order history and total spent

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project with the required tables

### Environment Variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Schema

The app uses the following Supabase tables:

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (full_name, email, phone, role, preferences) |
| `products` | Bakery products (name, price, description, image_url, category_id, is_available) |
| `categories` | Product categories (Brownies, Cookies, Loaves) |
| `orders` | Customer orders (user_id, order_number, pickup_date, pickup_time, status, total_amount) |
| `order_items` | Line items per order (product_id, quantity, price_at_purchase, custom_notes) |

---

## Project Structure

```
src/
├── app/                  # Next.js App Router pages and API routes
│   ├── api/              # REST API endpoints
│   │   ├── products/
│   │   ├── orders/
│   │   ├── profile/
│   │   └── admin/
│   ├── admin/            # Admin dashboard pages
│   └── (customer pages)  # Home, menu, cart, checkout, profile, auth
├── components/           # Reusable React components
├── context/              # AuthContext, CartContext
└── lib/                  # Supabase client, auth helpers
```

---

## API

Full API documentation is available in [API.md](./API.md).

### Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | None | List all available products |
| GET | `/api/products/[id]` | None | Get a single product |
| POST | `/api/admin/products` | Admin | Create a product |
| PUT | `/api/admin/products/[id]` | Admin | Update a product |
| DELETE | `/api/admin/products/[id]` | Admin | Delete a product |
| POST | `/api/orders` | Auth | Place an order |
| GET | `/api/orders` | Auth | Get current user's orders |
| GET | `/api/orders/[id]` | Auth | Get a single order |
| GET | `/api/admin/orders` | Admin | Get all orders |
| PUT | `/api/admin/orders/[id]` | Admin | Update order status |
| GET | `/api/admin/customers` | Admin | Get all customers |
| GET | `/api/admin/customers/[id]` | Admin | Get a single customer |
| GET | `/api/profile` | Auth | Get current user's profile |
| PUT | `/api/profile` | Auth | Update current user's profile |
| DELETE | `/api/profile` | Auth | Delete current user's account |

---

## Testing

The app has 42 Playwright end-to-end tests across 7 test files.

| File | Area | Tests |
|------|------|-------|
| `login.spec.ts` | Authentication | 7 |
| `register.spec.ts` | Authentication | 5 |
| `forgot-password.spec.ts` | Authentication | 4 |
| `homepage.spec.ts` | Customer — Browsing | 7 |
| `menu.spec.ts` | Customer — Browsing | 6 |
| `product-detail.spec.ts` | Customer — Browsing | 9 |
| `cart.spec.ts` | Customer — Ordering | 4 |

### Run Tests Locally

```bash
# Run all tests
npm run test:e2e

# Run with browser visible
npx playwright test --headed

# View HTML report
npx playwright show-report
```

---

## CI/CD

GitHub Actions runs automatically on every push to `main`:

1. Builds the Next.js application
2. Runs all 42 Playwright E2E tests against a local server
3. On success, Vercel automatically redeploys the production app

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_SITE_URL` | Set to `http://localhost:3000` for CI |
| `TEST_ADMIN_EMAIL` | Admin account email for login tests |
| `TEST_ADMIN_PASSWORD` | Admin account password for login tests |

---

## Deployment

The app is deployed on Vercel. Every push to `main` triggers an automatic redeployment.

### Required Vercel Environment Variables

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel deployment URL |

After setting these, also update in Supabase → Authentication → URL Configuration:
- **Site URL** — your Vercel URL
- **Redirect URLs** — add `https://your-vercel-url/reset-password`
