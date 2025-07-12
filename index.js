const express = require('express');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('Package Tracker API is running!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
// Sample tracking data (can later be replaced with MongoDB)
const trackingData = {
  "ABC123": {
    status: "In transit",
    history: [
      "Package received at warehouse",
      "Departed facility",
      "In transit to destination"
    ]
  },
  "XYZ789": {
    status: "Delivered",
    history: [
      "Package received",
      "Shipped",
      "Delivered"
    ]
  }
};

// Root route

// Track route
app.get('/track', (req, res) => {
  const code = req.query.code;
  const data = trackingData[code];

  if (data) {
    res.json({ trackingCode: code, ...data });
  } else {
    res.status(404).json({ error: "Tracking code not found" });
  }
});
