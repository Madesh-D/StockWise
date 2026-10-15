# StockWise — Inventory Management System

StockWise is a full-stack inventory management web application that helps manage products, monitor stock quantities, and identify low-stock items through a dashboard.

## Live Demo

**Website:** https://stock-wise-amber.vercel.app/

**GitHub Repository:** https://github.com/Madesh-D/StockWise

## Features

- Admin login and logout
- Dashboard with inventory statistics
- Add, view, edit, and delete products
- Search products by name or category
- Filter products by category
- Low-stock alerts
- Inventory value and stock summary reports
- MySQL database integration
- Responsive dashboard using Bootstrap
- Protected product APIs requiring an admin session

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Web application and backend APIs |
| React | User interface |
| TypeScript | Application development |
| Bootstrap | Responsive styling |
| MySQL | Database |
| mysql2 | MySQL database connection |
| jose | Session token signing and verification |
| Vercel | Website deployment |
| Railway | Online MySQL hosting |
| Git and GitHub | Version control and source code hosting |

## Getting Started

### Prerequisites

- Node.js and npm
- MySQL database
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Madesh-D/StockWise.git
   ```

2. Open the project folder:

   ```bash
   cd StockWise
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env.local` file in the project root and configure the required environment variables.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open http://localhost:3000 in your browser.

## Environment Variables

Configure the following variables locally in `.env.local` and in your deployment environment:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`

Use your own database connection details and strong admin credentials. Never commit `.env.local` or publish passwords, database credentials, or session secrets.

## Project Structure

```text
StockWise/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   └── products/
│   ├── login/
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── auth.ts
│   └── db.ts
├── public/
├── package.json
└── README.md
```

## Learning Outcomes

This project demonstrates full-stack web development, REST-style API development, MySQL integration, admin authentication, CRUD operations, and cloud deployment.

## Future Improvements

- Advanced inventory reports and export options
- Improved authentication and session management
- Multi-user access and role-based permissions