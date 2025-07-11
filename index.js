const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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
app.get('/', (req, res) => {
  res.send('📦 Greg’s Package Tracker is live!');
});

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
