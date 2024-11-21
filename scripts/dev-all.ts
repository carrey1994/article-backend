#!/usr/bin/env bun
import { $ } from "bun";

async function main() {
  console.log("🚀 Starting development servers...");

  try {
    // Start PostgreSQL if not running
    console.log("📦 Checking database...");
    await $`docker-compose up -d db`;

    // Start backend server
    console.log("🔧 Starting backend server on port 3000...");
    const backend = Bun.spawn(["bun", "run", "dev"], {
      cwd: ".",
      stdio: ["inherit", "inherit", "inherit"]
    });

    // Start frontend server
    console.log("🎨 Starting frontend server on port 3001...");
    const frontend = Bun.spawn(["npm", "run", "dev"], {
      cwd: "./frontend",
      stdio: ["inherit", "inherit", "inherit"]
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      console.log("\n🛑 Shutting down servers...");
      backend.kill();
      frontend.kill();
      await $`docker-compose down`;
      process.exit(0);
    });

    // Keep the script running
    await new Promise(() => {});
  } catch (error) {
    console.error("❌ Error starting servers:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}