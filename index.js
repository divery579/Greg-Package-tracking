const express = require("express");
const app = express();
const path = require("path");

const PORT = process.env.PORT || 3000;

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
packageDatabase["XYZ2789"] = {
  trackingCode: "XYZ2789",
  status: "Out for delivery",
  location: "Main Street, Warrenton MO",
  history: ["Shipped", "In transit", "Out for delivery"],
};

// Add/Update package
app.post("/admin/update", (req, res) => {
  const { code, data } = req.body;

  if (!isValidCode(code)) {
    return res.status(400).json({ error: "Invalid tracking code format" });
  }

  // ✅ Default to "Pending" if no status is provided
  if (!data.status) {
    data.status = "Pending";
  }

  packageDatabase[code] = data;
  res.json({ message: "Package data updated." });
});
}); // ✅ This closing brace was missing

// Track package by code
app.get("/track/:code", (req, res) => {
  const code = req.params.code;

  if (!isValidCode(code)) {
    return res.status(400).json({ error: "Invalid tracking code" });
  }

  const packageData = packageDatabase[code];

  if (packageData) {
    res.status(200).json(packageData);
  } else {
    res.status(404).json({ error: "Package not found" });
  }
});

// Get receipt
app.get("/receipt/:code", (req, res) => {
  const code = req.params.code;

  if (!isValidCode(code)) {
    return res.status(400).json({ error: "Invalid tracking code" });
  }

  const packageData = packageDatabase[code];

  if (packageData) {
    res.status(200).json({ receipt: true, ...packageData });
  } else {
    res.status(404).json({ error: "Package not found" });
  }
});

// Get status
app.get("/status/:code", (req, res) => {
  const code = req.params.code;

  if (!isValidCode(code)) {
    return res.status(400).json({ error: "Invalid tracking code" });
  }

  const packageData = packageDatabase[code];

  if (packageData) {
    res.status(200).json({ status: packageData.status });
  } else {
    res.status(404).json({ error: "Package not found" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
