# Leadbull Network


## Overview
This README will guide you through setting up the application in dev mode using Docker Compose.

## Prerequisites

- **Docker**: Ensure Docker is installed on your machine. You can download it from [here](https://www.docker.com/get-started).
- **Docker Compose**: Ensure Docker Compose is installed. You can download it from [here](https://docs.docker.com/compose/install/).


## Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/abdulmonaim-rob/leadbull-backend.git
   cd leadbull-backend
    ```

2. **setup environment variables**

    The application requires a .env file with specific configurations.
    Follow these steps:

    - Create a new file named `.env.dev` in the root directory of the project.

    - Copy the contents of the `.env.example` file into the `.env.dev` file.

         ``` bash
         cp .env.example .env.dev
         ```

    - Update the values as needed.

3. **spin up the app in dev mode**

   ```bash
    docker-compose -f compose.yaml -f compose.dev.yaml up -d --build
   ```
