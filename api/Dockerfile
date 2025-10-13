# Base stage - common dependencies
FROM node:22-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Development stage
FROM base AS development

# Install all dependencies (including devDependencies)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Expose application port
EXPOSE 3000

# Default command (can be overridden in docker-compose)
CMD ["pnpm", "run", "start:dev"]

# Builder stage for production
FROM base AS builder

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:22-alpine AS production

# Install pnpm and curl for health checks
RUN apk add --no-cache curl && npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose application port
EXPOSE 3000

# Run the application
CMD ["node", "dist/src/main.js"]

# Migrations stage
FROM node:22-alpine AS migrations

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy built application and node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Copy TypeScript configuration and mikro-orm configuration
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/mikro-orm.config.ts ./

# Default command for migrations
CMD ["pnpm", "run", "migration:up"]
