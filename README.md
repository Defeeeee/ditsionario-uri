# Ditsionario Uri

This is a [Next.js](https://nextjs.org) project that implements a dictionary of Uri's unique terms and expressions.

## Features

- Search for terms in the dictionary
- Propose new terms and definitions
- Admin dashboard to approve or reject suggestions
- CSV-based database for persistent storage

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database

The application uses CSV files for data persistence. The files are stored in the `data` directory at the root of the project:

- `pending_suggestions.csv`: Stores suggestions that are pending approval
- `approved_suggestions.csv`: Stores suggestions that have been approved

The database is automatically initialized when the application starts.

## Authentication

The application has two types of users:

- Regular users: Can log in with the password `urigoat`
- Admin users: Can log in with the password `uriadmin` and access the admin dashboard

## Admin Dashboard

The admin dashboard allows administrators to:

- View pending suggestions
- Approve or reject suggestions
- View approved suggestions

## API Endpoints

The application provides the following API endpoints:

- `GET /api/suggestions?type=all|pending|approved`: Fetch suggestions
- `POST /api/suggestions`: Add a new suggestion
- `PUT /api/suggestions`: Approve or reject a suggestion
- `GET /api/init-db`: Initialize the database

## Project Structure

- `app/page.js`: Main application component
- `app/utils/database.js`: Database utility functions
- `app/api/suggestions/route.js`: API endpoints for suggestions
- `app/api/init-db/route.js`: API endpoint to initialize the database
- `data/`: Directory for CSV files

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
