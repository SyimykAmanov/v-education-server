# v-education-server

Backend REST API for v-education learning platform.

## Tech Stack
- Node.js
- Express
- PostgreSQL
- dotenv

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL

### Installation
1. Clone the repository
2. Install dependencies:
   npm install
3. Create .env file:
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=v-education
   DB_USER=postgres
   DB_PASSWORD=your_password
4. Run the server:
   npm run dev

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | API info |
| GET | /subjects | Get all subjects |
| GET | /subjects/:subjectId | Get subject with lessons |
| GET | /subjects/:subjectId/lessons/:lessonId | Get single lesson |