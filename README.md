# 99 Pancakes Retail Analytics App

A comprehensive retail analytics web application for the 99 Pancakes store chain with role-based access control, daily sales tracking, and predictive analytics.

## Features

- **User Authentication**: Role-based access (Admin/Normal users)
- **Daily Sales Entry**: Comprehensive form for outlet staff
- **Admin Dashboard**: Historical data, analytics, and user management
- **Predictive Analytics**: Inventory forecasting and sales predictions
- **Data Visualization**: Interactive charts and reports
- **Multi-outlet Support**: Centralized management of multiple stores

## Tech Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **Charts**: Chart.js
- **Deployment**: Docker

## Project Structure

```
pancakes-analytics/
├── backend/           # Node.js Express API
├── frontend/          # React.js application
├── database/          # SQL schemas and migrations
├── docker/           # Docker configurations
└── README.md
```

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up database: `npm run db:setup`
4. Start development: `npm run dev`

## Environment Variables

Create `.env` files in both backend and frontend directories with required configurations.

## Deployment

Use Docker for production deployment:
```bash
docker-compose up -d
```

## License

Private - 99 Pancakes Store Chain