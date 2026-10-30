# Cartora — MERN E-Commerce Application

Cartora is a full-stack e-commerce web application built using the MERN stack. It provides a modern shopping experience with product browsing, search and filtering, shopping cart management, user authentication, checkout, online payments, and order tracking.

## Live Demo

- **Frontend:** https://cartora-taupe.vercel.app

- **Backend API:** https://cartora-backend-0fjd.onrender.com

## Features

- **Product Browsing:** View products, search, and filter by category.
- **Product Details:** View product information and add items to the cart.
- **Shopping Cart:** Add products, update quantities, remove items, and view totals.
- **User Authentication:** Register, log in, and access protected pages.
- **Cart Persistence:** Maintain a guest cart and synchronize it after login.
- **Checkout:** Enter delivery details and place orders.
- **Multiple Payment Methods:** Pay using Cash on Delivery or Razorpay Test Mode.
- **Razorpay Integration:** Create payment orders, open Razorpay Checkout, and verify payment signatures on the backend.
- **Order History:** View previous orders from the account page.
- **Profile Management:** Update account information.
- **Admin Dashboard:** Manage products and customer orders.
- **Backend API:** Manage products, users, carts, payments, and orders through Express routes.
- **Database:** Store application data in MongoDB using Mongoose.

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcrypt
- Razorpay Node.js SDK

### Deployment
- Vercel — Frontend hosting
- Render — Backend hosting
- MongoDB Atlas — Cloud database
- Razorpay — Payment gateway (Test Mode)

## Project Structure

```text
Cartora/
├── client/                 # React frontend
│   └── src/
├── server/                 # Express backend
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── seedProducts.js
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js and npm
- MongoDB Atlas account or a MongoDB instance
- Git
- Razorpay account for Test Mode payment integration

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
cd Cartora
```

### 2. Configure the Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

Replace the example values with your own credentials.

**Important:** Never commit `.env` files, database credentials, JWT secrets, or Razorpay secret keys to GitHub.

Start the backend:

```bash
npm run dev
```

The backend runs locally on port `5000` by default.

### 3. Configure the Frontend

Open a second terminal:

```bash
cd client
npm install
```

For local development, the frontend uses `http://localhost:5000` as the backend API address by default.

To configure another backend address, set the `VITE_API_URL` environment variable to your backend's base URL, if required by the frontend configuration.

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

## Payment Integration

Cartora supports two payment methods:

### Cash on Delivery
Customers can place orders and pay when their products are delivered.

### Razorpay Test Mode
- Creates payment orders through the backend.
- Calculates order amounts using product prices stored in MongoDB.
- Opens Razorpay Checkout on the frontend.
- Verifies payment signatures securely on the backend.
- Updates the order's payment status after successful verification.
- Stores Razorpay order and payment references in MongoDB.

**Note:** Razorpay is configured for Test Mode. Test transactions do not represent real payments. Live payments require separate Razorpay activation and production credentials.

## Available Scripts

### Frontend

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run lint` | Run the code linter |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build |

### Backend

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server with Nodemon |
| `npm start` | Start the server with Node.js |

## Deployment Environment Variables

Configure the following variables in the Render backend service:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used for JWT authentication |
| `RAZORPAY_KEY_ID` | Razorpay Test Mode Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay Test Mode Key Secret |
| `PORT` | Server port (provided by Render in production) |

Configure the frontend's API base URL to point to the deployed backend.

## Security Notes

- Environment files and credentials must not be committed.
- Passwords are hashed before storage.
- Protected endpoints require authentication.
- Administrative endpoints require the appropriate role.
- Razorpay payment signatures are verified on the backend.
- Razorpay secret keys are never exposed to the frontend.

## Project Status

Cartora includes the core e-commerce workflow, customer authentication, product and cart management, checkout, order processing, admin functionality, and Razorpay Test Mode integration.

The frontend and backend are deployed using Vercel and Render, respectively.

## Author

Developed as a full-stack e-commerce project using the MERN stack.