const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public")); // Serve frontend files
app.use(express.json());           // Parse JSON body

// === Load & Save Persistent JSON Database ===
const DATA_FILE = "./data.json";

let packageDatabase = {};
if (fs.existsSync(DATA_FILE)) {
  try {
    const fileContent = fs.readFileSync(DATA_FILE, "utf8");
    packageDatabase = JSON.parse(fileContent);
  } catch (err) {
    console.error("Failed to load data.json:", err);
    packageDatabase = {};
  }
}

function saveDatabase() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(packageDatabase, null, 2));
}

// === Reusable validation function ===
function isValidCode(code) {
  const unsafeKeys = ["__proto__", "constructor", "prototype"];
  return (
    typeof code === "string" &&
    /^[a-zA-Z0-9_-]+$/.test(code) &&
    !unsafeKeys.includes(code)
  );
}

// === Serve frontend pages ===
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/track", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "track.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/receipt", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "receipt.html"));
});

// === API Endpoints ===

// Track a package by code
app.get("/api/track/:code", (req, res) => {
  const code = req.params.code;
  if (!isValidCode(code) || !packageDatabase[code]) {
    return res.status(404).json({ error: "Tracking code not found" });
  }
  res.json(packageDatabase[code]);
});

// Update or create tracking data
app.post("/admin/update", (req, res) => {
  const { code, data } = req.body;

  if (!isValidCode(code) || !data) {
    return res.status(400).json({ error: "Invalid code or data" });
  }

  if (!packageDatabase[code]) {
    packageDatabase[code] = { trackingCode: code };
  }

  Object.assign(packageDatabase[code], data);
  saveDatabase(); // ✅ Save to file
  res.json({ message: "Package data updated" });
});

// === Start server ===
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
