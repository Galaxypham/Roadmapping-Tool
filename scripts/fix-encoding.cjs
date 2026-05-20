// One-shot helper: walks src/ and converts any UTF-16 LE files to UTF-8.
// Cursor's StrReplace tool on Windows occasionally writes UTF-16 LE which
// Vite's parser can't read. Run with `node scripts/fix-encoding.cjs`.
const fs = require("fs");
const path = require("path");

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const exts = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".css",
  ".json",
  ".html",
  ".md",
]);

let count = 0;
for (const f of walk("src")) {
  if (!exts.has(path.extname(f))) continue;
  const b = fs.readFileSync(f);
  if (b.length < 2) continue;
  // BOM-marked UTF-16 LE: FF FE
  if (b[0] === 0xff && b[1] === 0xfe) {
    fs.writeFileSync(f, b.slice(2).toString("utf16le"), "utf8");
    console.log("converted (BOM):", f);
    count++;
    continue;
  }
  // BOMless UTF-16 LE heuristic: every other byte is 0x00 in the first 16 bytes
  if (b[1] === 0 && b[0] !== 0) {
    let suspicious = true;
    for (let i = 1; i < Math.min(b.length, 32); i += 2) {
      if (b[i] !== 0) {
        suspicious = false;
        break;
      }
    }
    if (suspicious) {
      fs.writeFileSync(f, b.toString("utf16le"), "utf8");
      console.log("converted:", f);
      count++;
    }
  }
}
console.log("total converted:", count);
