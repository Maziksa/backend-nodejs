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
npm run db:create
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
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## Core Features

- Register and login with email/password.
- Users have roles (admin/user).
- Create, read, update, and delete articles with permissions (only creator or admin can edit/delete).
- Admins can view all users and manage their roles.
- Store articles in PostgreSQL via Sequelize models and migrations.
- Upload and remove file attachments linked to articles.
- Export an article as a PDF file (server-side generation).
- Receive real‑time notifications about article and attachment changes via WebSockets.
- Search articles by title or content (case-insensitive) via search input in the article list.

## Workspaces

Articles can be organized by workspace: `personal`, `university`, `work`.
Filter available in article list.

## Search

Users can search for articles by entering text in the search input field on the article list page.
- Search matches articles where the title or content contains the search text (case-insensitive).
- Search integrates with workspace filtering.

## Article Versioning
- Every update to an article creates a new immutable version.
- Users can view the full history of changes.
- Old versions are available in read-only mode via the UI sidebar.
- Workspace changes are also tracked in history.

## Role-Based Access Control (RBAC)
- `admin` and `user`. First registered user automatically becomes admin.
- Only the article creator or an admin can edit or delete articles.
- Admins can access User Management page to view and modify user roles.
- Backend enforces permissions on all endpoints requiring authorization.

**Note**: To create an admin user, simply register as the first user in the application. Subsequent registrations will create regular users.

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user info |

### Articles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/articles` | List articles (authenticated); supports `?workspace=<value>&search=<text>` query params |
| POST | `/api/articles` | Create article (authenticated) |
| GET | `/api/articles/:id` | Get article (authenticated) |
| GET | `/api/articles/:id/export/pdf` | Export article as PDF (authenticated). |
| PUT | `/api/articles/:id` | Update article (creator or admin only) |
| DELETE | `/api/articles/:id` | Delete article (creator or admin only) |
| POST | `/api/articles/:id/attachments` | Upload attachment |
| DELETE | `/api/articles/:id/attachments/:attachmentId` | Delete attachment |
| POST | `/api/articles/:id/comments` | Add comment |
| DELETE | `/api/comments/:id` | Delete comment |

### User Management (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users (admin) |
| PUT | `/api/users/:id/role` | Update user role (admin) |