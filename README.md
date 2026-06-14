# 🛒 Smart Market

Smart Market is a full-stack SaaS platform developed to optimize modern market operations, manage smart product tracking, and deliver AI-powered business analytics.

You can access the live application here: **[Smart Market Live](https://smart-market-git-main-yagizaydinlis-projects.vercel.app/)**

---

## 🚀 Key Features

* **Smart POS & Sales Management:** Fast, dynamic, and flexible checkout and retail operations management.
* **AI-Powered Search & Analytics:** Integrated with Groq Cloud AI to provide intelligent product search, stock predictions, and advanced data analytics.
* **Advanced Inventory & Stock Tracking:** Categorization, automated critical stock level alerts, and detailed product lifecycle management.
* **Dynamic Configuration:** Highly flexible infrastructure that can be customized on-the-fly based on specific store requirements.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** Next.js (React)
* **Hosting/Deployment:** Vercel

### Backend
* **Framework:** .NET 8 / 9 Web API (Minimal APIs)
* **Hosting/Deployment:** Railway

### Database & Infrastructure
* **Database:** PostgreSQL (Hosted on Supabase, utilizing high-performance `Npgsql Connection Pooling`)
* **AI Engine:** Groq Cloud AI Service

---

## ⚙️ Installation and Local Setup

Follow these steps to clone the project and run it on your local environment.

### 1. Prerequisites
* .NET SDK (Version 8.0 or higher)
* Node.js (Version 18 or higher)
* A Supabase project or a local PostgreSQL instance

### 2. Backend Setup
```bash
# Clone the repository
git clone [https://github.com/your-username/smart-market.git](https://github.com/your-username/smart-market.git)
cd smart-market/backend

# Restore dependencies
dotnet restore

# Configure your database connection string in appsettings.json or via Environment Variables:
# "ConnectionStrings:DefaultConnection": "Host=...;Port=6543;Database=postgres;Username=...;Password=...;"

# Run the application
dotnet run
