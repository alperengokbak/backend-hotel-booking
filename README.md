# Booking Hotel Backend

This repository contains the backend code for the Booking Hotel application. The backend is built using Node.js, Express.js, and Prisma ORM.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Middleware](#middleware)
- [Database](#database)
- [Authentication](#authentication)
- [Error Handling](#error-handling)

## Getting Started

### Prerequisites

Ensure you have the following software installed on your machine:

- Node.js
- PostgreSQL (or any other compatible database)
- npm or yarn package manager

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/alperengokbak/backend-hotel-booking.git
   ```

2. Install dependencies:

   ```bash
   cd backend-hotel-booking
   npm install
   ```

3. Set up your environment variables:

   Create a `.env` file in the root directory and define the following variables:

   ```env
   DB_URL=your_postgres_database_url
   TOKEN_SECRET=your_jwt_secret
   APP_SECRET =your_app_secret
   ```

4. Run the application:

   ```bash
   npm run migrate
   npm run dev
   ```

The backend server should now be running on [http://localhost:3000](http://localhost:3000).

## Project Structure

The project structure follows a modular approach, with separate directories for controllers, routes, middleware, and configurations. The main file is `index.js`, which initializes the Express application and sets up the server.

```plaintext
booking-hotel-backend
├── config
│   └── allowedOrigins.js
├── controllers
│   ├── AdminController.js
│   ├── CustomerController.js
│   └── HotelController.js
├── routes
│   ├── AdminRoute.js
│   ├── CustomerRoute.js
│   └── HotelRoute.js
├── middleware.js
├── index.js
├── schema.prisma
└── .env
```

## Configuration

The application uses a `.env` file to manage environment variables. The `.env` file should be created in the root directory with the following variables:

```env
DB_URL=your_postgres_database_url
TOKEN_SECRET=your_jwt_secret
APP_SECRET =your_app_secret
```

## API Endpoints

### Customer Routes

- **POST /customer/register**: Register a new customer.
- **POST /customer/login**: Log in a customer.
- **GET /customer/check**: Check user authentication.

### Admin Routes

- **POST /admin/add-hotel**: Add a new hotel (requires admin privileges).
- **DELETE /admin/delete-hotel**: Delete a hotel (requires admin privileges).

### Hotel Routes

- **GET /hotel/main**: Get main page hotel information.
- **GET /hotel/search**: Search for available hotels.
- **GET /hotel/weekend**: Get available hotels for the upcoming weekend.
- **GET /hotel/:id**: Get information for a specific hotel.
- **POST /hotel/booking**: Book a hotel room.
- **DELETE /hotel/booking**: Cancel a hotel booking.

## Middleware

- **isAuthorized**: Verifies the user's JWT token for authentication.
- **isAdmin**: Checks if the user has admin privileges.

## Database

The application uses Prisma ORM to interact with the PostgreSQL database. The database schema is defined in `schema.prisma`.

## Authentication

User authentication is handled using JSON Web Tokens (JWT). The `isAuthorized` middleware ensures that routes requiring authentication are protected.

## Error Handling

Error responses are standardized and include appropriate status codes along with informative error messages.
