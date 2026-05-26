const express = require('express');
const compression = require('compression');
const path = require('path');

const app = express();
const publicDir = path.join(__dirname, 'public');

app.use(compression());

app.use(
  express.static(publicDir, {
    maxAge: '365d',
    setHeaders(res, filePath) {
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.html') {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  })
);

app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(3000, () => console.log('ASSAM TEA running at http://localhost:3000'));
