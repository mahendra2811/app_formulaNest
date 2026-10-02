import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resolve, join } from "node:path";
import { sampleData } from "../src/data/sample.ts";
import { normalizeSources } from "../src/data/normalize.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = resolve(root, process.argv[2] ?? "planning /preplexity");
const names = (await readdir(source))
  .filter((name) => name.endsWith(".json"))
  .sort();
if (!names.length) throw new Error(`No JSON files in ${source}`);
const inputs = [];
for (const file of names) {
  const raw = await readFile(join(source, file), "utf8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    throw new Error(`${file}: ${error.message}`);
  }
  inputs.push({
    file,
    sha256: createHash("sha256").update(raw).digest("hex"),
    data,
  });
}
const { data, report } = normalizeSources(inputs, sampleData);
await mkdir(join(root, "src/data/generated"), { recursive: true });
await writeFile(
  join(root, "src/data/generated/content.json"),
  JSON.stringify(data) + "\n",
);
await writeFile(
  join(root, "docs/content-import-report.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.info(JSON.stringify(report.counts, null, 2));
console.info(
  `Resolved reference variants: ${report.resolvedReferences.length}; pending reference variants: ${report.unresolvedReferences.length}`,
);
