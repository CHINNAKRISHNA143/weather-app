const fs = require("node:fs/promises");
const path = require("node:path");
const { publishSourcemap } = require("@newrelic/publish-sourcemap");

const staticDirectory = path.resolve(".vercel/output/static");
const applicationId = process.env.VITE_NEW_RELIC_APP_ID;
const apiKey = process.env.NEW_RELIC_API_KEY;
const appUrl = process.env.APP_URL?.replace(/\/+$/, "");
const repoUrl = process.env.GITHUB_REPOSITORY
  ? `https://github.com/${process.env.GITHUB_REPOSITORY}`
  : undefined;
const releaseName = process.env.RELEASE_NAME;
const releaseId = process.env.RELEASE_ID;
const buildCommit = process.env.BUILD_COMMIT;

async function findSourceMaps(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return findSourceMaps(entryPath);
      }
      return entry.isFile() && entry.name.endsWith(".js.map") ? [entryPath] : [];
    })
  );
  return nested.flat();
}

function uploadSourceMap(options) {
  return new Promise((resolve, reject) => {
    publishSourcemap(options, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

async function main() {
  const missing = [
    ["VITE_NEW_RELIC_APP_ID", applicationId],
    ["NEW_RELIC_API_KEY", apiKey],
    ["APP_URL", appUrl],
    ["RELEASE_NAME", releaseName],
    ["RELEASE_ID", releaseId],
    ["BUILD_COMMIT", buildCommit],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing required source-map upload configuration: ${missing.join(", ")}`);
  }

  const sourceMaps = await findSourceMaps(staticDirectory);
  if (sourceMaps.length === 0) {
    throw new Error(`No JavaScript source maps found in ${staticDirectory}`);
  }

  for (const sourceMapPath of sourceMaps) {
    const javascriptPath = sourceMapPath.slice(0, -".map".length);
    const relativePath = path
      .relative(staticDirectory, javascriptPath)
      .split(path.sep)
      .join("/");
    const javascriptUrl = `${appUrl}/${relativePath}`;

    await uploadSourceMap({
      sourcemapPath: sourceMapPath,
      javascriptUrl,
      applicationId,
      apiKey,
      releaseName,
      releaseId,
      repoUrl,
      buildCommit,
    });

    console.log(`Uploaded source map for ${javascriptUrl}`);
  }

  console.log(`Successfully uploaded ${sourceMaps.length} source maps to New Relic.`);
}

main().catch((error) => {
  const details = [
    error.message,
    error.status && `HTTP status: ${error.status}`,
    error.response?.text,
  ]
    .filter(Boolean)
    .join("\n");
  console.error(
    "New Relic source-map upload failed:",
    details || error.stack || "Unknown upload error"
  );
  process.exitCode = 1;
});
