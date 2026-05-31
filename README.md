# 📦 Courier Management System

A full-stack web application for managing courier bookings, tracking shipments, and maintaining customer records. Built with Node.js, Express, and MySQL — with a clean HTML/CSS/JS frontend.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running Locally](#running-locally)
- [API Overview](#api-overview)
- [Contributing](#contributing)

---

## ✨ Features

- 📬 **Courier Booking** — Register new shipments with sender, receiver, weight, and dispatch details
- 🔍 **Shipment Tracking** — Track parcels by unique UUID-based tracking number
- 👥 **Customer Management** — Store and manage sender/receiver profiles with deduplication
- 🔄 **Status Updates** — Update delivery status (Pending → In Transit → Delivered)
- 🗓️ **Dispatch & Delivery Dates** — Record and display key shipment timeline data
- 🗃️ **Relational Data Model** — Normalized MySQL schema with foreign key relationships
- 📱 **Responsive UI** — Clean frontend served as static files via Express

---

## 🛠 Tech Stack

| Layer       | Technology                     |
|-------------|-------------------------------|
| Frontend    | HTML5, CSS3, JavaScript        |
| Backend     | Node.js, Express.js            |
| Database    | MySQL (via mysql2)             |
| Utilities   | UUID (tracking numbers), dotenv, cors |
| Dev Tools   | Nodemon                        |

---

## 🗄 Database Schema

The application uses a `CourierDB` MySQL database with two core tables:

**`Customers`**
| Column       | Type          | Description                  |
|--------------|---------------|------------------------------|
| CustomerID   | INT (PK, AI)  | Auto-incremented primary key |
| FullName     | VARCHAR(100)  | Customer full name           |
| PhoneNumber  | VARCHAR(20)   | Contact number               |
| Address      | VARCHAR(255)  | Delivery / pickup address    |

**`Couriers`**
| Column          | Type            | Description                            |
|-----------------|-----------------|----------------------------------------|
| CourierID       | INT (PK, AI)    | Auto-incremented primary key           |
| TrackingNumber  | VARCHAR(50)     | Unique UUID-based tracking number      |
| SenderID        | INT (FK)        | References `Customers.CustomerID`      |
| ReceiverID      | INT (FK)        | References `Customers.CustomerID`      |
| Weight          | DECIMAL(10,2)   | Parcel weight in kg                    |
| Status          | VARCHAR(50)     | Shipment status (default: `Pending`)   |
| DispatchDate    | DATE            | Date of dispatch                       |
| DeliveryDate    | DATE            | Expected or actual delivery date       |
| Remarks         | VARCHAR(255)    | Optional notes                         |

---

## 📁 Project Structure

```
Courier-Management-System/
├── public/              # Static frontend (HTML, CSS, JS)
│   ├── index.html
│   ├── styles/
│   └── scripts/
├── server.js            # Express app & API routes
├── db.js                # MySQL connection pool
├── init.sql             # Database initialization script
├── package.json
└── .env                 # Environment variables (not committed)
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MySQL](https://dev.mysql.com/downloads/) (v8.0 or higher)
- [npm](https://www.npmjs.com/)

### Clone the Repository

```bash
git clone https://github.com/Som-02/Courier-Management-System.git
cd Courier-Management-System
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=CourierDB
PORT=3000
```

> ⚠️ Never commit your `.env` file. Add it to `.gitignore`.

---

## 🗃 Database Setup

Run the provided SQL script to create the database and tables:

```bash
mysql -u root -p < init.sql
```

This will create:
- `CourierDB` database
- `Customers` table
- `Couriers` table (with foreign key references to `Customers`)

---

## 🏃 Running Locally

```bash
# Install dependencies
npm install

# Start in production mode
npm start

# Start in development mode (with auto-reload)
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 🔌 API Overview

| Method | Endpoint                        | Description                     |
|--------|---------------------------------|---------------------------------|
| GET    | `/api/couriers`                 | Fetch all couriers              |
| GET    | `/api/couriers/:trackingNumber` | Track a courier by tracking ID  |
| POST   | `/api/couriers`                 | Book a new courier              |
| PUT    | `/api/couriers/:id/status`      | Update courier status           |
| GET    | `/api/customers`                | Fetch all customers             |
| POST   | `/api/customers`                | Register a new customer         |

> Note: Verify exact route paths against `server.js` and update if needed.

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add: your feature description"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

<div align="center">
  Made with 🚚 by <a href="https://github.com/Som-02">Somnath</a>
</div>
