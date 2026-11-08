/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

const ENV_KEYS = [
  "CMI5_ENDPOINT",
  "CMI5_FETCH",
  "MENTOR_API_URL",
  "MENTOR_VIDEO_URL",
  "GATSBY_GRAPHQL_ENDPOINT",
  "GATSBY_NPCEDITOR_ENDPOINT",
  "GATSBY_STAGE",
  "GATSBY_IS_SENTRY_ENABLED",
];
const root = fileURLToPath(new URL(".", import.meta.url));
const source = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, root, [...ENV_KEYS]);
  const define: Record<string, string> = { global: "globalThis" };
  for (const key of ENV_KEYS) {
    define[`process.env.${key}`] = JSON.stringify(
      process.env[key] ?? fileEnv[key] ?? ""
    );
  }
  return {
    base: "/chat/",
    publicDir: "static",
    plugins: [react()],
    envPrefix: [],
    define,
    resolve: {
      alias: [{ find: "@", replacement: source }],
      tsconfigPaths: true,
    },
    server: { port: 8000, strictPort: true },
    preview: { port: 8001, strictPort: true },
    build: { outDir: "public", sourcemap: false },
  };
});
