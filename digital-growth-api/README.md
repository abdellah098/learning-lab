# DigitalGrowth API

A production-ready Express.js REST API with MongoDB for project management, featuring authentication, authorization, and comprehensive CRUD operations.

## Features

- 🔐 JWT Authentication with refresh token rotation
- 👥 Role-based access control (Admin, Project Manager, Project Member)
- 🏗️ Modular architecture by feature
- 📊 Comprehensive project, client, and user management
- 🔒 Security best practices (CORS, rate limiting, input validation)
- 📝 Structured logging with Pino
- 🐳 Docker support for MongoDB
- ✅ Input validation with Zod schemas
- 🚦 Standardized error handling and API responses

## Tech Stack

- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **Validation**: Zod schemas
- **Logging**: Pino (JSON structured logs)
- **Security**: CORS, Helmet, Rate limiting

## Quick Start

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd project-management-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB with Docker**
```bash
npm run docker:up
```