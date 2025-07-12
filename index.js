const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve frontend files from the public directory
app.use(express.static('public'));

// Parse JSON bodies
app.use(express.json());

// Route handlers for different pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/tracking.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tracking.html'));
});

app.get('/results.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'results.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/support.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'support.html'));
});

// Simple in-memory database for demo purposes
const packageDatabase = {
  'ABC123': {
    trackingCode: 'ABC123',
    status: 'Delivered',
    history: ['Package received', 'In transit', 'Out for delivery', 'Delivered'],
    estimatedDelivery: '2024-01-15',
    receipt: true
  },
  'XYZ789': {
    trackingCode: 'XYZ789',
    status: 'Out for delivery',
    history: ['Package received', 'In transit', 'Out for delivery'],
    estimatedDelivery: '2024-01-20',
    receipt: false
  },
  'Gg10122520': {
    trackingCode: 'Gg10122520',
    status: 'In transit',
    history: ['Package received', 'Departed facility', 'In transit to destination'],
    estimatedDelivery: '2024-01-25',
    receipt: false
  }
};

// API endpoint for tracking package
app.get('/api/track/:code', (req, res) => {
  const code = req.params.code;
  
  // Check if package exists in database
  if (packageDatabase[code]) {
    res.json(packageDatabase[code]);
    return;
  }

  // Default simulated tracking data for new packages
  const history = [
    "Package received at warehouse",
    "Departed facility",
    "In transit to destination"
  ];

  // Estimated delivery: 3 days from now
  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const packageData = {
    trackingCode: code,
    status: "In transit",
    history,
    estimatedDelivery: estimatedDelivery.toISOString().split('T')[0]
  };
  
  // Add to database
  packageDatabase[code] = packageData;
  
  res.json(packageData);
});

// Admin API endpoints
app.get('/api/admin/search/:code', (req, res) => {
  const code = req.params.code;
  
  if (packageDatabase[code]) {
    res.json({ found: true, ...packageDatabase[code] });
  } else {
    res.json({ found: false });
  }
});

app.post('/api/admin/update-status', (req, res) => {
  const { trackingCode, status } = req.body;
  
  if (packageDatabase[trackingCode]) {
    packageDatabase[trackingCode].status = status;
    packageDatabase[trackingCode].history.push(status);
    res.json({ success: true });
  } else {
    res.json({ success: false, error: 'Package not found' });
  }
});

app.post('/api/admin/assign-delivery', (req, res) => {
  const { trackingCode, deliveryDate } = req.body;
  
  if (packageDatabase[trackingCode]) {
    packageDatabase[trackingCode].estimatedDelivery = deliveryDate;
    res.json({ success: true });
  } else {
    res.json({ success: false, error: 'Package not found' });
  }
});

app.post('/api/admin/upload-document', (req, res) => {
  const { trackingCode } = req.body;
  
  if (packageDatabase[trackingCode]) {
    // Simulate document upload
    packageDatabase[trackingCode].receipt = true;
    packageDatabase[trackingCode].documentName = req.file?.filename || 'receipt.pdf';
    res.json({ success: true });
  } else {
    res.json({ success: false, error: 'Package not found' });
  }
});

app.get('/api/receipt/:code', (req, res) => {
  const code = req.params.code;
  
  if (packageDatabase[code] && packageDatabase[code].receipt) {
    // Simulate receipt download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${code}.pdf"`);
    res.send('This would be a PDF receipt for package ' + code);
  } else {
    res.status(404).json({ error: 'Receipt not found' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
