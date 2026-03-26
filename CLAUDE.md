# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Starting the Project

**Start MySQL (XAMPP):**
```
/c/xampp/mysql/bin/mysqld --standalone --console &
```

**Start Node.js server:**
```
cd /d/royal_plastic && node server.js
```

Server runs at `http://localhost:3000`. The static `index.html` is served from the same port.

**Database setup (first time):**
```
/c/xampp/mysql/bin/mysql -u root -e "source D:/royal_plastic/db.sql"
```

## Architecture

Single-page website (`index.html`) + Express backend (`server.js`) + MariaDB via XAMPP.

- **`index.html`** — entire frontend: HTML, CSS, and JS in one file. No build step.
- **`server.js`** — Express app serving static files and REST API on port 3000.
- **`db.sql`** — schema for `royal_plastic_db` database.
- **`package.json`** — dependencies: `express`, `mysql2`, `cors`.

## Database

- **Host:** localhost, **User:** root, **Password:** (empty), **DB:** `royal_plastic_db`
- **Tables:** `messages` (contact form submissions), `orders` (product orders)
- Connect via HeidiSQL or mysql CLI at `/c/xampp/mysql/bin/mysql`

## API Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| GET/POST | `/api/messages` | Fetch / submit contact messages |
| DELETE | `/api/messages/:id` | Delete one message |
| DELETE | `/api/messages` | Clear all messages |
| GET/POST | `/api/orders` | Fetch / place orders |
| PUT | `/api/orders/:id/status` | Update order status |
| DELETE | `/api/orders/:id` | Delete one order |

## Git Workflow

After every change, commit and push:
```
git add -A && git commit -m "message" && git push
```

GitHub repo: https://github.com/abdur123/royal-plastic
