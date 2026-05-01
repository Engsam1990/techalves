// @ts-nocheck
import fs from "fs";
import path from "path";
import { Router } from "express";
import { requireAuth, requireSuperAdmin } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";
import { executeDb, queryDb } from "../../lib/db";

const router = Router();
router.use(requireAuth);
router.use(requireSuperAdmin);

function resolveMigrationsDir() {
  const candidates = [
    path.resolve(process.cwd(), "database", "manual-migrations"),
    path.resolve(process.cwd(), "..", "database", "manual-migrations"),
    path.resolve(__dirname, "..", "..", "..", "..", "database", "manual-migrations"),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
}

const migrationsDir = resolveMigrationsDir();

function migrationId(filename: string) {
  return filename.replace(/\.sql$/i, "");
}

function listMigrationFiles() {
  if (!fs.existsSync(migrationsDir)) return [];
  return fs
    .readdirSync(migrationsDir)
    .filter((filename) => filename.toLowerCase().endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b))
    .map((filename) => {
      const fullPath = path.join(migrationsDir, filename);
      const stat = fs.statSync(fullPath);
      return {
        id: migrationId(filename),
        filename,
        path: fullPath,
        size: stat.size,
        modifiedAt: stat.mtime.toISOString(),
      };
    });
}

async function ensureMigrationTable() {
  await queryDb(`
    CREATE TABLE IF NOT EXISTS \`schema_migrations\` (
      \`id\` varchar(191) NOT NULL,
      \`filename\` varchar(255) NOT NULL,
      \`applied_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`schema_migrations_filename_unique\` (\`filename\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function appliedMigrationMap() {
  await ensureMigrationTable();
  const rows = await queryDb("SELECT `id`, `filename`, `applied_at` FROM `schema_migrations` ORDER BY `applied_at` ASC");
  return new Map((Array.isArray(rows) ? rows : []).map((row: any) => [
    String(row.id || row.filename || ""),
    {
      id: String(row.id || ""),
      filename: String(row.filename || ""),
      appliedAt: row.applied_at ? new Date(row.applied_at).toISOString() : null,
    },
  ]));
}

function splitSqlStatements(sql: string) {
  const statements: string[] = [];
  let delimiter = ";";
  let buffer = "";

  for (const rawLine of sql.split(/\r?\n/)) {
    const trimmed = rawLine.trim();
    if (/^DELIMITER\s+/i.test(trimmed)) {
      const pending = buffer.trim();
      if (pending) {
        statements.push(pending);
        buffer = "";
      }
      delimiter = trimmed.replace(/^DELIMITER\s+/i, "").trim() || ";";
      continue;
    }

    buffer += `${rawLine}\n`;
    if (buffer.trimEnd().endsWith(delimiter)) {
      const statement = buffer.trimEnd().slice(0, -delimiter.length).trim();
      if (statement) statements.push(statement);
      buffer = "";
    }
  }

  const tail = buffer.trim();
  if (tail) statements.push(tail);
  return statements.filter((statement) => {
    const withoutComments = statement
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("--"))
      .join("\n")
      .trim();
    return Boolean(withoutComments);
  });
}

async function runMigration(file: ReturnType<typeof listMigrationFiles>[number]) {
  const sql = fs.readFileSync(file.path, "utf8");
  const statements = splitSqlStatements(sql);

  for (const statement of statements) {
    await queryDb(statement);
  }

  await executeDb(
    "INSERT INTO `schema_migrations` (`id`, `filename`, `applied_at`) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE `filename` = VALUES(`filename`)",
    [file.id, file.filename]
  );

  return { ...file, statementCount: statements.length };
}

router.get("/", async (_req, res, next) => {
  try {
    const applied = await appliedMigrationMap();
    const migrations = listMigrationFiles().map((file) => {
      const appliedRecord = applied.get(file.id);
      return {
        id: file.id,
        filename: file.filename,
        size: file.size,
        modifiedAt: file.modifiedAt,
        status: appliedRecord ? "applied" : "pending",
        appliedAt: appliedRecord?.appliedAt || null,
      };
    });

    res.json({
      migrations,
      pendingCount: migrations.filter((item) => item.status === "pending").length,
      appliedCount: migrations.filter((item) => item.status === "applied").length,
    });
  } catch (e) {
    next(e);
  }
});

router.post("/run", async (req, res, next) => {
  try {
    const targetId = String(req.body?.id || "").trim();
    const applied = await appliedMigrationMap();
    const pending = listMigrationFiles().filter((file) => !applied.has(file.id));
    const selected = targetId ? pending.filter((file) => file.id === targetId || file.filename === targetId) : pending;

    if (targetId && selected.length === 0) {
      throw new AppError(404, "Pending migration not found");
    }

    const ran = [];
    for (const file of selected) {
      ran.push(await runMigration(file));
    }

    const refreshedApplied = await appliedMigrationMap();
    const migrations = listMigrationFiles().map((file) => {
      const appliedRecord = refreshedApplied.get(file.id);
      return {
        id: file.id,
        filename: file.filename,
        size: file.size,
        modifiedAt: file.modifiedAt,
        status: appliedRecord ? "applied" : "pending",
        appliedAt: appliedRecord?.appliedAt || null,
      };
    });

    res.json({ ran, migrations, pendingCount: migrations.filter((item) => item.status === "pending").length });
  } catch (e) {
    next(e);
  }
});

export default router;
