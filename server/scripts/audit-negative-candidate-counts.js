// Read-only audit. Run from server/: node scripts/audit-negative-candidate-counts.js
// JSON Lines go to stdout; progress and totals go to stderr.
// Redirect stdout to a file to retain a report. No candidate details beyond
// identifiers and the affected fields are included.
const DEFAULT_COLLECTIONS = ["candidates", "us-candidates"];

function findNegativeValues(value, path = "", findings = []) {
  if (value === null || value === undefined) return findings;
  let numeric;
  let storedAs;
  if (typeof value === "number") {
    numeric = value;
    storedAs = "number";
  } else if (typeof value === "string" && /^-\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(value.trim())) {
    numeric = Number(value);
    storedAs = "string";
  } else if (["Int32", "Long", "Double", "Decimal128"].includes(value?._bsontype)) {
    numeric = Number(value.toString());
    storedAs = value._bsontype;
  }
  if (numeric !== undefined) {
    if (numeric < 0) findings.push({ path, value: String(value), storedAs });
    return findings;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => findNegativeValues(entry, `${path}[${index}]`, findings));
  } else if (typeof value === "object" && !value._bsontype && !(value instanceof Date) && !Buffer.isBuffer(value)) {
    for (const [key, entry] of Object.entries(value)) {
      findNegativeValues(entry, path ? `${path}.${key}` : key, findings);
    }
  }
  return findings;
}

async function auditCollection(collection, emit) {
  const summary = { collection: collection.collectionName, scanned: 0, affected: 0, negativeValues: 0, fields: {} };
  // Use raw documents so schema defaults/casting cannot hide legacy values.
  const cursor = collection.find({}).batchSize(200);
  try {
    for await (const candidate of cursor) {
      summary.scanned++;
      const findings = findNegativeValues(candidate);
      if (!findings.length) continue;
      summary.affected++;
      summary.negativeValues += findings.length;
      for (const finding of findings) {
        const field = finding.path.replace(/\[\d+\]/g, "[]");
        summary.fields[field] = (summary.fields[field] || 0) + 1;
      }
      await emit({ collection: collection.collectionName, _id: String(candidate._id), userId: candidate.userId, findings });
    }
  } finally {
    await cursor.close();
  }
  return summary;
}

async function main(args = process.argv.slice(2)) {
  if (args.includes("--help")) {
    console.log("Usage: node scripts/audit-negative-candidate-counts.js [--collection NAME] ...\n" +
      "Defaults: candidates and us-candidates in MONGODB_URI (.env supported).\n" +
      "Read-only: scans all numeric fields, including nested arrays and negative numeric strings.\n" +
      "Findings are JSON Lines on stdout; totals are on stderr. Negative values require review,\n" +
      "since fields such as coordinates may legitimately be negative. No writes are performed.");
    return;
  }
  const collections = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] !== "--collection" || !args[i + 1] || args[i + 1].startsWith("--")) {
      throw new Error("Expected --collection NAME. Use --help for usage.");
    }
    collections.push(args[++i]);
  }
  require("dotenv").config({ quiet: true });
  if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI for the intended database.");
  const mongoose = require("mongoose");
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    const db = mongoose.connection.db;
    console.error(`Read-only audit of database: ${db.databaseName}`);
    for (const name of new Set(collections.length ? collections : DEFAULT_COLLECTIONS)) {
      if (!(await db.listCollections({ name }, { nameOnly: true }).toArray()).length) {
        console.error(`Collection ${name} does not exist; skipped.`);
        continue;
      }
      const summary = await auditCollection(db.collection(name), async (record) => {
        const line = JSON.stringify(record) + "\n";
        await new Promise((resolve, reject) => process.stdout.write(line, (error) => error ? reject(error) : resolve()));
      });
      console.error(JSON.stringify(summary));
    }
    console.error("Audit completed. No documents changed.");
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) main().catch((error) => {
  console.error(`Audit failed: ${error.message}`);
  process.exitCode = 1;
});

module.exports = { findNegativeValues, auditCollection };
