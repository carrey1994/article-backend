# Use the official Bun image
FROM oven/bun:latest

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
RUN bun build ./index.ts --outdir ./dist

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Run database migrations and start the application
CMD bunx prisma migrate deploy && bun run start