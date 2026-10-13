# QuickBite — Food Delivery & Restaurant Platform

A high-performance, full-stack food delivery application built with **C# 12, ASP.NET Core Web API, Microsoft SQL Server, and React (Vite)**.

![QuickBite Architecture](https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80)

---

## 🌟 Key Features

- **Food & Restaurant Discovery**: Browse popular restaurants filtered by cuisine (*Burgers, Pizzas, Biryani, Healthy, Japanese, Desserts*).
- **Interactive Menu & Customization**: Inspect dish details, veg/non-veg badges, prices, and add directly to the cart.
- **Dynamic Cart Drawer**: Live subtotal calculations, taxes (8%), delivery fees, and quantity increments/decrements.
- **Atomic Checkout & Payment Processing**: ACID transaction in Microsoft SQL Server linking `Orders`, `OrderItems`, and `PaymentTransactions`.
- **Live 4-Step Order Tracker**: Animated stepper tracking the order from *Order Confirmed* ➔ *Kitchen Preparing* ➔ *Rider On The Way* ➔ *Delivered*.
- **Past Orders History**: View all historic orders stored persistently in Microsoft SQL Server.
- **Swagger Documentation**: Interactive OpenAPI testing console at `/swagger`.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend Framework** | **C# 12 & ASP.NET Core Web API (.NET)** | High-throughput REST API controllers, transactions, DTOs |
| **Database Engine** | **Microsoft SQL Server (LocalDB)** | ACID compliant relational database (`(localdb)\PersonalProjects`) |
| **ORM & Data Access** | **Entity Framework Core 10** | Model mapping, LINQ queries, automatic migrations & seeding |
| **Frontend Framework** | **React 18 & Vite** | Fast, responsive single-page application with Lucide icons |
| **Design System** | **Vanilla CSS3 (Design Tokens)** | Inter typography, responsive cards, slide drawers, stepper |

---

## 🚀 Quick Start (Running Locally)

### 1. Prerequisites
- [.NET 8 / 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js v18+](https://nodejs.org/)
- Microsoft SQL Server LocalDB (`sqllocaldb`)

### 2. Run with 1-Click
Double-click `run.bat` or run in terminal:
```cmd
run.bat
```

Or run manually:
```cmd
# 1. Start the private SQL Server instance
sqllocaldb start PersonalProjects

# 2. Run the C# Web API (automatically serves React UI and Swagger)
dotnet run --project QuickBite.Api/QuickBite.Api.csproj
```

Open your browser to:
- **Application UI**: [http://localhost:5004](http://localhost:5004) (or [http://localhost:5149](http://localhost:5149))
- **Swagger API Console**: [http://localhost:5004/swagger](http://localhost:5004/swagger)

---

## 🗄️ SQL Server Database Schema (`QuickBiteDb`)

To view your tables in **SQL Server Management Studio (SSMS)**:
1. Connect to Server Name: **`(localdb)\PersonalProjects`**
2. Authentication: **Windows Authentication**
3. Expand **Databases** ➔ **`QuickBiteDb`** ➔ **Tables**:

- `dbo.Restaurants`: Restaurant metadata, ratings, delivery times, banner images.
- `dbo.MenuItems`: Food items, categories, pricing, veg flags.
- `dbo.Orders`: Customer details, status, delivery address, subtotal, taxes, total.
- `dbo.OrderItems`: Individual lines linked to `OrderId` by foreign key.
- `dbo.PaymentTransactions`: Transaction ID, payment method, success status.

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/restaurants` | List all restaurants (optional `?cuisine=` filter) |
| `GET` | `/api/restaurants/{id}` | Get restaurant details with menu |
| `GET` | `/api/menu/categories` | Get all cuisine categories |
| `GET` | `/api/menu/search?q={query}` | Search dishes across all restaurants |
| `POST` | `/api/orders` | Place a new order with atomic transaction |
| `GET` | `/api/orders/{id}` | Get specific order receipt by ID |
| `GET` | `/api/orders` | List all past orders |
| `POST` | `/api/orders/{id}/advance-status` | Advance order status (*Placed ➔ Preparing ➔ Rider ➔ Delivered*) |
| `GET` | `/api/health` | Live health check showing SQL Server connection |
