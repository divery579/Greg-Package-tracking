const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve frontend files from the public directory
app.use(express.static('public'));

// API endpoint for tracking package
app.get('/api/track/:code', (req, res) => {
  const code = req.params.code;

  // Simulated tracking data
  const history = [
    "Package received at warehouse",
    "Departed facility",
    "In transit to destination"
  ];

  // Estimated delivery: 3 days from now
  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  res.json({
    trackingCode: code,
    status: "In transit",
    history,
    estimatedDelivery: estimatedDelivery.toISOString().split('T')[0]
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
