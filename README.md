<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Subsynapse - Subscription Sharing

This guide provides the minimal steps to run the project using Docker after cloning the repository.

## Prerequisites

* [Git](https://git-scm.com/downloads)
* [Docker](https://www.docker.com/products/docker-desktop/)

## How to Run

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/subsynapse-subscription-sharing.git](https://github.com/your-username/subsynapse-subscription-sharing.git)
    cd subsynapse-subscription-sharing
    ```

2.  **Build the Docker image:**
    ```bash
    docker build -t subsynapse-dev .
    ```

3.  **Run the container:**
    This command maps your local `src` folder for live-reloading.
    ```bash
    docker run -p 3000:3000 -v ./src:/app/src subsynapse-dev
    ```

## Accessing the Application

Once the container is running, open your browser and go to:

[**http://localhost:3000**](http://localhost:3000)
