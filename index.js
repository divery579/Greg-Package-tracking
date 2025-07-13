const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public")); // Serve frontend files
app.use(express.json()); // Parse JSON body

const packageDatabase = Object.create(null); // Avoid prototype pollution

// Reusable validation function
function isValidCode(code) {
  const unsafeKeys = ["__proto__", "constructor", "prototype"];
  return (
    typeof code === "string" &&
    /^[a-zA-Z0-9_-]+$/.test(code) &&
    !unsafeKeys.includes(code)
  );
}

// Serve pages
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

// Sample test data
packageDatabase["PEND1234"] = {
  trackingCode: "PEND1234",
  status: "Pending",
  location: "Label Created",
  history: ["Label created, not yet shipped"],
};
app.post("/admin/update", (req, res) => {
  const { code, data } = req.body;
  if (!code || !data) {
    return res.status(400).json({ error: "Missing code or data" });
  }

  // Create or update the entry
  if (!packageDatabase[code]) {
    packageDatabase[code] = {};
  }

  Object.assign(packageDatabase[code], data);

  res.json({ message: "Package data updated" });
});
app.listen(port, () => {
  console.log("Delivery update sent:", { code, date });
