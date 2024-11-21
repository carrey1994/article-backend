#!/usr/bin/env bun
import { $ } from "bun";
import { watch } from "fs";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "start";

  switch (command) {
    case "start":
      await startDev();
      break;
    case "db:reset":
      await resetDatabase();
      break;
    case "db:seed":
      await seedDatabase();
      break;
    case "test":
      await runTests();
      break;
    case "build":
      await build();
      break;
    default:
      showHelp();
  }
}

async function startDev() {
  console.log("🚀 Starting development server...");
  
  // Watch for Prisma schema changes
  watch("prisma", { recursive: true }, async (eventType, filename) => {
    if (filename?.endsWith(".prisma")) {
      console.log("🔄 Prisma schema changed, regenerating client...");
      await $`bunx prisma generate`;
    }
  });

  // Start the development server
  await $`bun run dev`;
}

async function resetDatabase() {
  console.log("🗃️  Resetting database...");
  await $`bunx prisma db push --force-reset`;
  await seedDatabase();
}

async function seedDatabase() {
  console.log("🌱 Seeding database...");
  await $`bun run db:seed`;
}

async function runTests() {
  console.log("🧪 Running tests...");
  await $`bun test`;
}

async function build() {
  console.log("📦 Building application...");
  await $`bunx prisma generate`;
  await $`bun build ./index.ts --outdir ./dist`;
}

function showHelp() {
  console.log(`
Development Script Help:
-----------------------
Commands:
  start     - Start development server (default)
  db:reset  - Reset and reseed database
  db:seed   - Seed database with test data
  test      - Run tests
  build     - Build application

Usage:
  bun run scripts/dev.ts [command]

Examples:
  bun run scripts/dev.ts
  bun run scripts/dev.ts db:reset
  bun run scripts/dev.ts test
  `);
}

// Make the script executable
if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    console.error("❌ Command failed:", error);
    process.exit(1);
  }
}