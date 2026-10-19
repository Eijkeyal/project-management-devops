import { AppDataSource } from "./src/shared/db/data-source";

await AppDataSource.initialize();
console.log("Migrations found:", AppDataSource.migrations.map((m) => m.name));
const ran = await AppDataSource.runMigrations();
console.log("Ran:", ran.map((m) => m.name));
await AppDataSource.destroy();