// Turns the built site in dist/ into redirect pages pointing at the canonical domain.
// Used by the GitHub Pages workflow so scottastone.github.io forwards to scottstone.ca.
import { readdir, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const TARGET = "https://scottstone.ca";
const DIST = process.argv[2] ?? "dist";

const page = (url) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Redirecting to ${url}</title>
<link rel="canonical" href="${url}">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${url}">
<script>location.replace(${JSON.stringify(TARGET)} + location.pathname + location.search + location.hash);</script>
</head>
<body><p>This site has moved to <a href="${url}">${url}</a>.</p></body>
</html>
`;

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.endsWith(".html")) yield path;
  }
}

let count = 0;
for await (const file of htmlFiles(DIST)) {
  let urlPath = "/" + relative(DIST, file).split(sep).join("/");
  urlPath = urlPath.replace(/index\.html$/, "").replace(/^\/404\.html$/, "/");
  await writeFile(file, page(TARGET + urlPath));
  count++;
}
console.log(`Wrote ${count} redirect page(s) to ${TARGET}`);
