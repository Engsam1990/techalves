// @ts-nocheck
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

let loaded = false;
let loadedEnvFile = "";

function loadFile(filePath: string, override = false) {
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath, override });
    loadedEnvFile = filePath;
    return true;
  }
  return false;
}

function inferRuntimeMode() {
  const lifecycleEvent = String(process.env.npm_lifecycle_event || "").trim().toLowerCase();
  if (["dev", "dev:server", "dev:client"].includes(lifecycleEvent)) {
    return "development";
  }

  const npmCommand = String(process.env.npm_command || "").trim().toLowerCase();
  if (npmCommand === "run-script" && lifecycleEvent.startsWith("dev")) {
    return "development";
  }

  const entry = String(process.argv[1] || "").trim().toLowerCase();
  if (!entry) return "";

  const normalizedEntry = entry.replace(/\\/g, "/");

  if (normalizedEntry.endsWith(".ts") || normalizedEntry.includes("/src/")) {
    return "development";
  }

  return "";
}

export function getLoadedEnvFile() {
  return loadedEnvFile || null;
}

export function loadEnv() {
  if (loaded) return;
  loaded = true;

  const rootDir = process.cwd();
  const explicitEnvFile = String(process.env.ENV_FILE || "").trim();
  const runtimeNodeEnv = String(process.env.NODE_ENV || "").trim().toLowerCase();
  const inferredMode = runtimeNodeEnv || inferRuntimeMode();

  if (explicitEnvFile) {
    const resolvedExplicitPath = path.isAbsolute(explicitEnvFile)
      ? explicitEnvFile
      : path.resolve(rootDir, explicitEnvFile);

    loadFile(resolvedExplicitPath, true);
    return;
  }

  const baseEnv = path.resolve(rootDir, ".env");
  const devEnv = path.resolve(rootDir, ".env.development");
  const prodEnv = path.resolve(rootDir, ".env.production");

  if (["development", "dev", "local", "test"].includes(inferredMode)) {
    loadFile(devEnv, true);
    loadFile(baseEnv, false);
    loadFile(devEnv, true);
    return;
  }

  loadFile(baseEnv, false);

  if (inferredMode === "production") {
    loadFile(prodEnv, true);
  }
}

loadEnv();
