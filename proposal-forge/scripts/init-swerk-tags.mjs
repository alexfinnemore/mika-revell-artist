/**
 * One-off script to initialize SWERK tags for image organization.
 *
 * Run from proposal-forge directory:
 *   node scripts/init-swerk-tags.mjs
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join("=").trim();
    }
  }
}

const SWERK_BASE_URL = "https://swerk.goosegroup.co";

async function initTags() {
  const apiKey = process.env.SWERK_API_KEY;
  const customerId = process.env.SWERK_CUSTOMER_ID;

  if (!apiKey || !customerId) {
    console.error("Missing SWERK_API_KEY or SWERK_CUSTOMER_ID environment variables");
    process.exit(1);
  }

  const tags = [
    { name: "generated-image", color: "#6366f1" },  // Indigo
    { name: "draft", color: "#f59e0b" },             // Amber
    { name: "favorite", color: "#ec4899" },          // Pink
    { name: "final", color: "#10b981" },             // Emerald
    { name: "kair-2026", color: "#3b82f6" },         // Blue (current project)
  ];

  console.log("Initializing SWERK tags...\n");

  // First, get existing tags
  const listResponse = await fetch(`${SWERK_BASE_URL}/api/tags?customerId=${customerId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!listResponse.ok) {
    console.error("Failed to list existing tags:", await listResponse.text());
    process.exit(1);
  }

  const existingTags = await listResponse.json();
  const existingNames = new Set(existingTags.map((t) => t.name));

  console.log("Existing tags:", existingNames.size ? Array.from(existingNames).join(", ") : "(none)");

  for (const tag of tags) {
    if (existingNames.has(tag.name)) {
      console.log(`✓ Tag "${tag.name}" already exists`);
      continue;
    }

    const response = await fetch(`${SWERK_BASE_URL}/api/tags`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId,
        name: tag.name,
        color: tag.color,
      }),
    });

    if (response.ok) {
      const created = await response.json();
      console.log(`✓ Created tag "${tag.name}" (id: ${created.id})`);
    } else {
      console.error(`✗ Failed to create tag "${tag.name}":`, await response.text());
    }
  }

  console.log("\nDone!");
}

initTags().catch(console.error);
