# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app/backend

# Copy package files and install dependencies
COPY backend/package*.json ./
RUN npm install

# Copy the rest of the backend source code
COPY backend/ .

# Build the TypeScript code
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app/backend

# Copy the built application from the builder stage
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/prisma ./prisma

# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD ["npm", "run", "start"]
