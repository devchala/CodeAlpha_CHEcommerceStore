# ChalaStore: Full-Stack E-commerce Web App

A full-stack e-commerce web application built for the **CodeAlpha Full Stack Development Internship**. Customers can browse products, register, add items to a cart and place orders. A separate **admin dashboard** lets the store owner manage products, orders and customers.

![Home page](screenshots/home.png)

## Table of contents
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Admin access](#admin-access)
- [API reference](#api-reference)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Future improvements](#future-improvements)
- [Author](#author)

## Features

**Storefront (customers)**
- Product catalogue with search, category filters, stock badges ("Only 3 left", "Sold out") and an image fallback
- Product detail page with quantity selector
- Shopping cart with quantity controls. **An account is required**: guests are sent to the login page and returned to where they were after signing in. Every user has their own cart
- User registration and login (passwords hashed with bcrypt, sessions with JWT)
- Checkout: prices and stock are re-checked **on the server**, and stock is reduced when an order is placed
- Order history page with status badges

**Admin dashboard** (`/admin.html`, a separate layout for the store owner)
- **Overview:** revenue, orders, customers and products totals, a 7-day sales chart, orders by status, recent orders and low-stock alerts
- **Products:** add, edit and delete products, with a live image preview
- **Orders:** see every customer's order and update its status (Pending, Processing, Shipped, Delivered)
- **Customers:** list of registered customers with their order count and total spent

**Interface**
- Dark mode: follows the system setting, can be toggled from the header, and is remembered in the browser
- Fully responsive layout for phones, tablets and desktops (hamburger menu on small screens, tables turn into cards)

## Screenshots

| Home page | Dark mode |
|:---:|:---:|
| ![Home](screenshots/home.png) | ![Dark mode](screenshots/dark-mode.png) |

| Admin dashboard | Mobile view |
|:---:|:---:|
| ![Admin dashboard](screenshots/admin-dashboard.png) | ![Mobile](screenshots/mobile.png) |

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3 (custom properties for theming), vanilla JavaScript |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose (MongoDB Atlas or a local MongoDB) |
| Authentication | JSON Web Tokens (JWT), bcryptjs |

## Project structure

```text
CodeAlpha_CHEcommerceStore/
├── client/                  # Static frontend, served by Express
│   ├── css/style.css        # Styles, light and dark themes, responsive rules
│   ├── js/                  # app.js, auth.js, cart.js, product.js, orders.js,
│   │                        # admin.js, common.js (shared helpers), theme.js
│   ├── images/              # Product images
│   └── index.html  product.html  cart.html  orders.html
│       login.html  register.html  admin.html
├── server/
│   ├── config/db.js         # MongoDB connection
│   ├── middleware/          # authMiddleware.js (JWT), adminMiddleware.js (admin only)
│   ├── models/              # User, Product, Order
│   ├── routes/              # authRoutes, productRoutes, orderRoutes, adminRoutes
│   ├── seed.js              # Loads sample products
│   ├── server.js            # App entry point
│   └── .env.example         # Template for environment variables
└── README.md
```

## Getting started

### Prerequisites
- [Node.js](https://nodejs.org/) 18 or newer
- A MongoDB database: a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster, or MongoDB installed locally

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/devchala/CodeAlpha_CHEcommerceStore.git
cd CodeAlpha_CHEcommerceStore/server

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env          # macOS / Linux
copy .env.example .env        # Windows (Command Prompt / PowerShell)

# 4. Open .env and fill in your values (see the table below)

# 5. Add the sample products
npm run seed

# 6. Start the server
npm run dev                   # auto-restarts on changes (nodemon)
# or
npm start
```

Then open **http://localhost:5000** in your browser.

> **Note:** `npm run seed` **deletes all existing products** and replaces them with the sample products. Do not run it again if you have added your own products through the admin dashboard.

## Environment variables

Create `server/.env` from `server/.env.example`:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port the server listens on | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority` |
| `JWT_SECRET` | Long random string used to sign login tokens. Keep it private | `a-long-random-secret-string` |
| `ADMIN_EMAIL` | The account with this email becomes the store admin | `admin@example.com` |

The server will not start if `MONGO_URI` or `JWT_SECRET` is missing. **Never commit your `.env` file**; it is already listed in `.gitignore`.

## Admin access

1. Set `ADMIN_EMAIL` in `server/.env` to the email you want to use as the admin.
2. Restart the server (the `.env` file is only read at startup).
3. Open `/register.html` and create an account with **exactly that email** (or log in if it already exists).
4. You are taken straight to the admin dashboard at `/admin.html`.

Admin accounts are for managing the store only: they see a **Dashboard** link instead of a cart and cannot place orders. If you logged in before setting `ADMIN_EMAIL`, log out and log in again to refresh your session.

## API reference

Base URL: `http://localhost:5000/api`. Protected routes need the header `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Description |
|-------:|----------|:------:|-------------|
| GET | `/health` | Public | Health check |
| POST | `/auth/register` | Public | Create an account |
| POST | `/auth/login` | Public | Log in and receive a JWT |
| GET | `/products` | Public | List all products |
| GET | `/products/:id` | Public | Get one product |
| POST | `/products` | Admin | Add a product |
| PUT | `/products/:id` | Admin | Update a product |
| DELETE | `/products/:id` | Admin | Delete a product |
| POST | `/orders` | Customer | Place an order (price and stock verified on the server) |
| GET | `/orders/my-orders` | Customer | The logged-in user's orders |
| GET | `/admin/stats` | Admin | Dashboard totals, sales chart data, low-stock items |
| GET | `/admin/orders` | Admin | All orders from all customers |
| PUT | `/admin/orders/:id/status` | Admin | Update an order's status |
| GET | `/admin/users` | Admin | Customer list with order totals |

## Security

- Passwords are hashed with **bcrypt**; they are never stored in plain text
- Login uses **JWT**; protected routes check the token on the server
- **Role-based access:** admin routes are restricted on the server, not just hidden in the interface
- **Order totals are recalculated on the server** from database prices, and stock is checked, so the browser cannot change what an order costs
- User-provided text is escaped before being shown on the page, which prevents HTML/script injection
- Secrets live in `.env`, which is excluded from version control

## Troubleshooting

**"Could not connect to any servers in your MongoDB Atlas cluster" / IP not whitelisted**
Atlas only accepts connections from approved IP addresses, and your IP changes when you switch networks. In Atlas open **Security → Network Access → Add IP Address → Add Current IP Address**, wait until the status is *Active*, then restart the server.

**Product images are not showing**
Run `npm run seed` again. Product images live in `client/images/` and are referenced as `images/<file>`.

**The Admin dashboard or link does not appear**
Check that the email you registered with matches `ADMIN_EMAIL` exactly, restart the server, then log out and log in again.

**"Missing MONGO_URI or JWT_SECRET" when starting**
Make sure the file is named `.env` (not `.env.example`) and is inside the `server` folder.

**Port already in use**
Change `PORT` in `.env`, or stop the other program using port 5000.

## Future improvements

- Online payment integration (for example Stripe)
- Image upload for products instead of an image path or URL
- Email notifications for new orders and status changes
- Product reviews and ratings
- Pagination for large catalogues and order lists
- Automated tests and deployment (for example Render or Railway)

## Author

**devchala**
GitHub: [@devchala](https://github.com/devchala)

Built as part of the **CodeAlpha Full Stack Development Internship**.
