import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        clearMocks: true,
        restoreMocks: true,
        exclude: [
            "**/node_modules/**",
            "**/.next/**",
            "**/.agent/**",
            "**/.git/**",
        ],
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
});
