# ChalaStore — Full Stack E-commerce

Full-stack e-commerce project for the **CodeAlpha Full Stack Development Internship**.

## Features
- Product catalogue with search, category filters, stock badges and image fallback
- Shopping cart (quantity controls) — **requires an account**; each user has their own cart
- User registration and login (bcrypt password hashing + JWT)
- Order processing: totals and stock are verified **on the server**, stock is reduced on purchase
- Product detail page, and an order history page for logged-in users
- **Separate admin dashboard** (`/admin.html`) with sidebar: sales overview and chart, product management, all orders with status updates, and customer list
- Dark mode (follows system setting, toggle in the header, remembered per browser)
- Fully responsive layout for phones, tablets and desktops

## Tech stack
HTML, CSS, JavaScript · Node.js, Express · MongoDB (Mongoose) · JWT

## Project structure
```text
ecommerce/
├── client/            # static frontend, served by Express
│   ├── css/  js/  images/
│   └── index.html  product.html  cart.html  orders.html  admin.html  login.html  register.html
└── server/
    ├── config/  middleware/ (auth + admin)  models/  routes/
    ├── seed.js        # loads sample products
    └── server.js
```

## Getting started
```bash
cd server
npm install
cp .env.example .env     # then fill in MONGO_URI, JWT_SECRET and ADMIN_EMAIL
npm run seed             # adds sample products
npm run dev              # or: npm start
```
Open **http://localhost:5000**

### Admin access
Set `ADMIN_EMAIL` in `.env`, restart the server, then **register (or log in) with that email**. Admins are sent straight to the dashboard after login, and their storefront menu shows **Dashboard** instead of a cart (admin accounts can't place orders). If you were logged in before, log out and in again to refresh your token.

## API
| Method | Endpoint | Auth | Description |
|-------:|----------|:----:|-------------|
| POST | `/api/auth/register` | – | Create account |
| POST | `/api/auth/login` | – | Log in, returns JWT |
| GET | `/api/products` | – | List products |
| GET | `/api/products/:id` | – | Single product |
| POST | `/api/products` | admin | Add product |
| PUT | `/api/products/:id` | admin | Update product |
| DELETE | `/api/products/:id` | admin | Delete product |
| POST | `/api/orders` | customer | Place order |
| GET | `/api/admin/stats` | admin | Dashboard totals, chart data, low stock |
| GET | `/api/admin/orders` | admin | All orders |
| PUT | `/api/admin/orders/:id/status` | admin | Update order status |
| GET | `/api/admin/users` | admin | Customer list |
| GET | `/api/orders/my-orders` | ✔ | Current user's orders |
| GET | `/api/health` | – | Health check |

## Troubleshooting: images not showing
- Run `npm run seed` again (it resets products using the correct `image` field).
- Product images live in `client/images/` and are referenced as `images/<file>`.
