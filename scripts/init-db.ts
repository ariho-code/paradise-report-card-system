import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const text = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    for (const line of text.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (!match) continue;
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // Next.js loads .env on its own; this is only for the standalone script.
  }
}

async function main() {
  loadEnv();
  const mod = await import("../lib/db");
  await mod.ensureSchema();
  await mod.sql.end({ timeout: 2 });
  console.log("Database ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
