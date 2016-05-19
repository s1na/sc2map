var express = require('express');
var app = require('../app/app');

app.set('views', './app/views');
app.use('/dist', express.static('./dist'));
app.use('/static', express.static('./app/public'));

const port = 3000 || process.env.PORT;
app.listen(port, function () {
  console.log(`Server running on http://localhost:${port}`);
});
