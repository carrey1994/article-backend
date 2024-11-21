#!/usr/bin/env bun
import { $ } from "bun";
import { existsSync } from "fs";

async function main() {
  console.log("🚀 Setting up development environment...");

  // Check if .env exists, if not create it from .env.example
  if (!existsSync(".env")) {
    console.log("📝 Creating .env file from .env.example...");
    await $`cp .env.example .env`;
  }

  // Install dependencies
  console.log("📦 Installing dependencies...");
  await $`bun install`;

  // Generate Prisma client
  console.log("🔄 Generating Prisma client...");
  await $`bunx prisma generate`;

  // Push database schema
  console.log("🗃️  Setting up database...");
  await $`bunx prisma db push --accept-data-loss`;

  // Seed database
  console.log("🌱 Seeding database...");
  await $`bun run db:seed`;

  console.log("\n✅ Setup complete! You can now run the following commands:");
  console.log("   • bun run dev - Start development server");
  console.log("   • bun test - Run tests");
  console.log("   • bun run db:studio - Open Prisma Studio");
  console.log("\n📝 Note: Make sure to update your .env file with your configuration");
}

// Make the script executable
if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
}