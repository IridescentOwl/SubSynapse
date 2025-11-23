# SubSynapse - Subscription Sharing

This guide provides the minimal steps to run the project using Docker after cloning the repository.

## Prerequisites

* [Git](https://git-scm.com/downloads)
* [Docker](https://www.docker.com/products/docker-desktop/)

## How to Run

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/SubSynapse.git](https://github.com/your-username/SubSynapse.git)
    cd SubSynapse
    ```

2.  **Build the Docker image:**
    ```bash
    docker build -t SubSynapse-dev .
    ```

3.  **Run the container:**
    This command maps your local `src` folder for live-reloading.
    ```bash
    docker run -p 3000:3000 -v ./src:/app/src SubSynapse-dev
    ```

## Accessing the Application

Once the container is running, open your browser and go to:

[**http://localhost:3000**](http://localhost:3000)

---

## Production Environment and Secret Management

This project uses `.env` files for managing environment variables. For production, you will need to create two files:

- `.env.production` in the root directory for the frontend.
- `backend/.env.production` for the backend.

You can use the `backend/.env.example` file as a template for the backend environment variables.

**Important:** These files contain sensitive information and should **never** be committed to version control. The `.gitignore` file is already configured to ignore these files.

To run the application in a production environment, you will need to populate these files with your production keys and configurations.
