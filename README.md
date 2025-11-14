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

---

## Local Development (API + Frontend)

1. **Install dependencies**
   ```bash
   # Frontend
   npm install

   # Backend
   cd backend
   npm install
   ```
2. **Create environment files**
   - Copy `backend/.env.example` to `backend/.env` and fill in the required secrets. Set `FRONTEND_URL` to `http://localhost:3000` (Vite dev server) and leave `PORT` at `4000`.
   - (Optional) Create a `.env.local` (or `.env`) in the project root with `VITE_API_BASE_URL=http://localhost:4000/api`. The frontend now defaults to relative `/api` calls, so you only need to override this if your backend runs elsewhere.
3. **Run the backend**
   ```bash
   cd backend
   npm run dev
   ```
   The API listens on `http://localhost:4000`.
4. **Run the frontend**
   ```bash
   npm run dev
   ```
   Vite proxies `/api/*` requests to `http://localhost:4000`, so the React app talks to the local backend without extra configuration.

---

## Production Environment and Secret Management

This project uses `.env` files for managing environment variables. For production, you will need to create two files:

- `.env.production` in the root directory for the frontend.
- `backend/.env.production` for the backend.

You can use the `backend/.env.example` file as a template for the backend environment variables.

**Important:** These files contain sensitive information and should **never** be committed to version control. The `.gitignore` file is already configured to ignore these files.

To run the application in a production environment, you will need to populate these files with your production keys and configurations.

### Frontend Environment Variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Explicit backend API base (include `/api`) | `window.location.origin + /api` |
| `VITE_API_PROXY_TARGET` | Dev server proxy target for `/api` | `http://localhost:4000` |

When running inside Docker, the frontend uses the relative `/api` path which is reverse-proxied to the backend container, so no additional configuration is required.
