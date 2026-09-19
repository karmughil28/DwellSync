# DwellSync — Smart Apartment Community Management System

## Project Overview
DwellSync is a production-style apartment community management web application built entirely using pure HTML5, CSS3, and Vanilla JavaScript. Designed for a 15-flat residential building (Flats A-101 to A-115).

## Distinct Portal Entry Points
- **Resident Portal:** `resident-login.html`
- **Admin Console:** `admin/admin-login.html`
- **Home Landing:** `index.html` (offers dual buttons to access both portals)

## Authentication Credentials
- **Admin Console:**
  - URL: `admin/admin-login.html`
  - Email: `admin@dwellsync.local`
  - Password: `admin123`
- **Resident Accounts:**
  - Created by Admin in `admin/residents.html`.
  - Flats: `A-101` through `A-115`.
  - Log in via `resident-login.html`.

## Community Chat
- Real-time cross-tab chat powered by `BroadcastChannel`.
- Strictly in-memory/ephemeral (zero permanent `localStorage` storage).
