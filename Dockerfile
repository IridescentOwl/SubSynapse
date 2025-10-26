# Best Practice: Use a specific, lightweight Node.js image.
# 'alpine' is a minimal version, making your image smaller.
FROM node:18-alpine

# Set the working directory inside the container.
WORKDIR /app

# Best Practice: Copy package files first and install dependencies.
# This takes advantage of Docker's layer caching. If these files don't change,
# Docker won't reinstall dependencies every time you build, which is much faster.
COPY package*.json ./
RUN npm install

# Now, copy the rest of your application's source code.
COPY . .

# Best Practice: Vite's default dev server port is 5173. Expose it.
EXPOSE 5173

# The command to start the development server.
# The '--' is to pass the '--host' flag directly to Vite.
# The '--host' flag is crucial for Docker, as it tells Vite to listen
# on all network interfaces, not just localhost, making it accessible
# from outside the container.
CMD [ "npm", "run", "dev", "--", "--host" ]
