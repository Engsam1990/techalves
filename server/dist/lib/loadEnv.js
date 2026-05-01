"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoadedEnvFile = getLoadedEnvFile;
exports.loadEnv = loadEnv;
// @ts-nocheck
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
let loaded = false;
let loadedEnvFile = "";
function loadFile(filePath, override = false) {
    if (fs_1.default.existsSync(filePath)) {
        dotenv_1.default.config({ path: filePath, override });
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
    if (!entry)
        return "";
    const normalizedEntry = entry.replace(/\\/g, "/");
    if (normalizedEntry.endsWith(".ts") || normalizedEntry.includes("/src/")) {
        return "development";
    }
    return "";
}
function getLoadedEnvFile() {
    return loadedEnvFile || null;
}
function loadEnv() {
    if (loaded)
        return;
    loaded = true;
    const rootDir = process.cwd();
    const explicitEnvFile = String(process.env.ENV_FILE || "").trim();
    const runtimeNodeEnv = String(process.env.NODE_ENV || "").trim().toLowerCase();
    const inferredMode = runtimeNodeEnv || inferRuntimeMode();
    if (explicitEnvFile) {
        const resolvedExplicitPath = path_1.default.isAbsolute(explicitEnvFile)
            ? explicitEnvFile
            : path_1.default.resolve(rootDir, explicitEnvFile);
        loadFile(resolvedExplicitPath, true);
        return;
    }
    const baseEnv = path_1.default.resolve(rootDir, ".env");
    const devEnv = path_1.default.resolve(rootDir, ".env.development");
    const prodEnv = path_1.default.resolve(rootDir, ".env.production");
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
//# sourceMappingURL=loadEnv.js.map