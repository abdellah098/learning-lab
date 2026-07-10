# COVID Case API

## Overview

The **COVID Case API** is a MuleSoft application developed with **Anypoint Studio** to manage COVID-19 patient records. It provides REST APIs to register new cases, update existing cases, retrieve patient information, and generate COVID case reports.

The application exposes HTTP endpoints and stores patient information in a PostgreSQL database.

---

## Features

* Register a new COVID case
* Update an existing COVID case
* Retrieve COVID case information by National ID
* Generate COVID case reports by state or for all states
* Validate incoming requests
* Centralized error handling
* Request logging with Transaction ID and Correlation ID

---

## Technology Stack

* Mule Runtime 4.11.0
* Java 17
* Maven
* Anypoint Studio
* PostgreSQL
* DataWeave 2.0

---

## API Endpoints

| Method | Endpoint                       | Description                           |
| ------ | ------------------------------ | ------------------------------------- |
| POST   | `/covid/v1/cases`              | Register a new COVID case             |
| PUT    | `/covid/v1/cases`              | Update an existing COVID case         |
| GET    | `/covid/v1/cases/{nationalId}` | Retrieve COVID case(s) by National ID |
| GET    | `/covid/v1/reports`            | Generate COVID case reports           |

---

## Application Flow

1. Client sends an HTTP request.
2. The application generates a Transaction ID and Correlation ID.
3. Incoming requests are validated.
4. Business logic is executed.
5. Data is read from or written to the PostgreSQL database.
6. The response is transformed into JSON (or XML where applicable) and returned to the client.

---

## Database

The application uses a PostgreSQL database and stores COVID case information in the `CVD_CASE_MASTER` table.

---

## Error Handling

The application includes global and flow-level error handling for common scenarios:

* **400** – Invalid request or validation failure
* **404** – COVID case not found
* **500** – Internal server error
* **503** – Database connectivity unavailable

---

## Logging

Each request is logged using:

* Transaction ID
* Correlation ID
* Flow start and completion messages

These logs help trace requests and simplify troubleshooting.

---

## Build Requirements

* Java 17
* Mule Runtime 4.11.0
* Maven
* PostgreSQL

---

## Running the Application

1. Clone the project.
2. Import it into Anypoint Studio.
3. Configure the PostgreSQL database connection.
4. Build the project using Maven.
5. Run the application.

The application listens on:

```
http://localhost:8081/covid
```

---

## Project Structure

```
src
├── main
│   ├── mule
│   │   ├── API flows
│   │   ├── Validation flows
│   │   ├── Database operations
│   │   └── Global error handling
│   └── resources
│       ├── JSON schemas
│       ├── Properties
│       └── Configuration files
```

---
