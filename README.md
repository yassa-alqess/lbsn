# Leadbull Sales Network

## Overview

This README will guide you through setting up the application in both development and production modes using Docker Compose.

## Prerequisites

- **Docker**: Ensure Docker is installed on your machine. You can download it from [here](https://www.docker.com/get-started).
- **Docker Compose**: Ensure Docker Compose is installed. You can download it from [here](https://docs.docker.com/compose/install/).

## Setup

### 1. Clone the Repository

```bash
git clone git@github.com:LeadBull-abdulmonaim/LB-services-backend.git
cd LB-services-backend
```

### 2. Set Up Environment Variables

The application requires specific environment variables for development and production modes. Follow these steps to configure the environment:

- For **Development** mode:
  - Create a new file named `.env.dev` in the root directory.
  - Copy the contents of the `.env.sample` file into the `.env.dev` file:

    ```bash
    cp .env.example .env.dev
    ```

  - Update the values in `.env.dev` as necessary.

- For **Production** mode:
  - Create a new file named `.env.prod` in the root directory.
  - Copy the contents of the `.env.sample` file into the `.env.prod` file:

    ```bash
    cp .env.example .env.prod
    ```

  - Update the values in `.env.prod` with production-specific values.

- Both **Development** and **Production** modes require additional Google service keys. Ensure you have the required `.keys/credentials.json` for Google services available in both environments.

### 3. Add SSL Certificates for Production (Optional)

For production, you need to provide self-signed certificates:

- Place the SSL certificates in a directory called `/certs` in the root of your project.
  - Example:
    - `/certs/privkey.pem`
    - `/certs/fullchain.pem`

### 4. Running the Application

- **Development Mode**:
  To run the app in development mode, execute the following command:

  ```bash
  docker-compose -f compose.yaml -f compose.dev.yaml up -d --build
  ```

- **Production Mode**:
  To run the app in production mode, execute the following command:

  ```bash
  docker-compose -f compose.yaml -f compose.prod.yaml up -d --build
  ```

### 5. Additional Notes

- Ensure that the `.keys` required for Google services are properly placed for both environments.
- The `certs` folder is only necessary for production environment.
