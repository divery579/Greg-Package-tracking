const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public")); // Serve frontend files
app.use(express.json()); // Parse JSON body

const packageDatabase = Object.create(null); // In-memory store

// Validation
function isValidCode(code) {
  const unsafeKeys = ["__proto__", "constructor", "prototype"];
  return (
    typeof code === "string" &&
    /^[a-zA-Z0-9-_]+$/.test(code) &&
    !unsafeKeys.includes(code)
  );
}

// Serve frontend pages
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

// Sample default package
packageDatabase["PEND1234"] = {
  trackingCode: "PEND1234",
  status: "Pending",
  location: "Label Created",
  history: ["Label created, not yet shipped"],
};

// Add or update full package data (used for delivery assignment, etc.)
app.post("/admin/update", (req, res) => {
  const { code, data } = req.body;

  if (!isValidCode(code) || !data) {
    return res.status(400).json({ success: false, error: "Invalid code or data" });
  }

  if (!packageDatabase[code]) {
    packageDatabase[code] = { trackingCode: code };
  }

  Object.assign(packageDatabase[code], data);
  console.log("Delivery update:", { code, data });

  res.json({ success: true, message: "Package data updated" });
});

// Update only status (used by status dropdown in admin panel)
app.post("/api/admin/update-status", (req, res) => {
  const { trackingCode, status } = req.body;

  if (!isValidCode(trackingCode) || !status) {
    return res.status(400).json({ success: false, error: "Invalid input" });
  }

  if (!packageDatabase[trackingCode]) {
    return res.status(404).json({ success: false, error: "Tracking code not found" });
  }

  packageDatabase[trackingCode].status = status;
  packageDatabase[trackingCode].history = packageDatabase[trackingCode].history || [];
  packageDatabase[trackingCode].history.push(`Status updated to: ${status}`);

  res.json({ success: true });
});

// Track by code (frontend sends this)
app.post("/api/track", (req, res) => {
  const { trackingCode } = req.body;

  if (!isValidCode(trackingCode)) {
    return res.status(400).json({ success: false, error: "Invalid tracking code" });
  }

  const data = packageDatabase[trackingCode];
  if (!data) {
    return res.status(404).json({ success: false, error: "Package not found" });
  }

  res.json({ success: true, data });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
