const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/containers',   require('./routes/containers'));
app.use('/api/partners',     require('./routes/partners'));
app.use('/api/orders',       require('./routes/orders'));
app.use('/api/fuel',         require('./routes/fuel'));
app.use('/api/maintenance',  require('./routes/maintenance'));
app.use('/api/trips',        require('./routes/trips'));
app.use('/api/stats',        require('./routes/stats'));
app.use('/api/reports',      require('./routes/reports'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
