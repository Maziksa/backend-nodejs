# Articles Application

A simple full‑stack articles application.  
Frontend is built with React, backend uses Node.js (Express), PostgreSQL, and Sequelize for data persistence.

---

## Project Structure

- `backend/` – REST API, WebSocket notifications, PostgreSQL integration.
- `frontend/` – React SPA for managing articles and attachments.

---

## Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL (running locally)
- npm or yarn

---

## Backend Setup

### 1. Install dependencies:

```
cd backend
npm install
```

### 2. Configure environment:

- Copy `.env.example` to `.env`.
- Set PostgreSQL connection variables (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).

### 3. Create database (if not created yet):

```
CREATE DATABASE articles_db;
```

### 4. Run migrations:

```
npx sequelize-cli db:migrate
```

Start backend server:

```
cd backend
npm run dev
```

The API will be available at `http://localhost:3001/api`.

## Frontend Setup

### 1. Install dependencies:

```
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## Core Features

- Create, read, update, and delete articles.
- Store articles in PostgreSQL via Sequelize models and migrations.
- Upload and remove file attachments linked to articles.
- Receive real‑time notifications about article and attachment changes via WebSockets.
