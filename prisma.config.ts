import * as dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({ path: ".env.local" });
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node scripts/seed.js",
  },
  datasource: {
    url:
      process.env["DATABASE_URL"] ||
      process.env["DIRECT_URL"] ||
      "postgresql://postgres:postgres@localhost:5432/zkrent",
  },
});
