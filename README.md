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
npm run db:create;
```

### 4. Run migrations:

```
npm run db:migrate
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

## Workspaces

Articles can be organized by workspace: `personal`, `university`, `work`.
Filter available in article list.

## Article Versioning
- Every update to an article creates a new immutable version.
- Users can view the full history of changes.
- Old versions are available in read-only mode via the UI sidebar.
- Workspace changes are also tracked in history.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/articles` | List articles |
| POST | `/api/articles` | Create article |
| GET | `/api/articles/:id` | Get article |
| PUT | `/api/articles/:id` | Update article |
| DELETE | `/api/articles/:id` | Delete article |
| POST | `/api/articles/:id/attachments` | Upload attachment |
| DELETE | `/api/articles/:id/attachments/:attachmentId` | Delete attachment |
| POST | `/api/articles/:id/comments` | Add comment |
| DELETE | `/api/comments/:id` | Delete comment |