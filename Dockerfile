# Use the official Bun image
FROM oven/bun:latest as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN bunx prisma generate

# Copy the rest of the application
COPY . .

# Build the application
RUN bun build ./index.ts --target bun --outdir ./dist

# Start fresh for runtime
FROM oven/bun:latest

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Run database migrations and start the application
CMD bunx prisma migrate deploy && bun run ./dist/index.js