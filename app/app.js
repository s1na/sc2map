var express = require('express');

var app = express();
app.set('view engine', 'pug');
//app.set('views', './views');
//app.use('/static', express.static('public'));


app.get('/', function (req, res) {
    res.render('index');
});

app.listen(9000, function () {
  console.log('Server started on port 9000');
});

module.exports = app;
