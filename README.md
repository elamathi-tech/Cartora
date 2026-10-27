# Cartora — MERN E-Commerce Application

Cartora is a full-stack e-commerce web application built with the MERN stack. It provides product browsing, shopping cart management, user authentication, checkout, and order tracking.

## Features

- **Product browsing:** View products, search, and filter by category.
- **Product details:** View product information and add items to the cart.
- **Shopping cart:** Add products, update quantities, remove items, and view totals.
- **User authentication:** Register, log in, and access protected pages.
- **Cart persistence:** Maintain a guest cart and synchronize it after login.
- **Checkout:** Submit delivery details and place orders using Cash on Delivery.
- **Order history:** View previous orders from the account page.
- **Profile management:** Update account information.
- **Backend API:** Manage products, users, carts, and orders through Express routes.
- **Database:** Store application data in MongoDB using Mongoose.

## Technology Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS
- React Router

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcrypt for password hashing

## Project Structure

```text
Cartora/
├── client/       # React frontend
│   └── src/
├── server/       # Express backend
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

## Getting Started

### 1. Clone the repository

```bash
git clone <your-github-repository-url>
cd Cartora
```

### 2. Configure the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret
```

Replace the example values with your own credentials. Never commit secrets to GitHub.

Start the backend:

```bash
npm run dev
```

The backend runs locally on port 5000 by default.

### 3. Configure the frontend

Open a second terminal:

```bash
cd client
npm install
```

For local development, the frontend uses `http://localhost:5000` by default.

To configure another backend address, set the `VITE_API_URL` environment variable to the backend's base URL.

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

## Available Scripts

### Frontend

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build |

### Backend

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server with Nodemon |
| `npm start` | Start the server with Node.js |

## Security Notes

- Environment files and credentials must not be committed.
- Passwords are hashed before storage.
- Protected endpoints require authentication.
- Administrative product-management endpoints require the appropriate role.

## Current Payment Support

Cash on Delivery is supported. Online payment integration is not currently enabled.

## Project Status

The core customer workflow has been tested locally, including registration, login, product browsing, cart operations, checkout, order placement, order history, and profile updates.

Deployment and final submission details will be added when available.

## Author

Developed as a full-stack e-commerce project using the MERN stack.
