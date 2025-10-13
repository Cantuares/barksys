# Stage 1: Migrations - Run migrations with ts-node (development mode)
FROM node:22-alpine AS migrations

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for ts-node)
RUN pnpm install --frozen-lockfile

# Copy source code and configuration
COPY . .

# Run migrations with ts-node (same as development)
CMD ["pnpm", "run", "migration:up"]

# Stage 2: Builder - Compile TypeScript to JavaScript
FROM node:22-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Stage 3: Production - Lightweight Alpine image with compiled code
FROM node:22-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose application port
EXPOSE 3000

# Run the application
CMD ["node", "dist/src/main.js"]
