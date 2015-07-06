var express = require('express');
var fs = require('fs');

var app = express();

app.use('/assets', express.static('assets'));
app.use('/bower_components', express.static('bower_components'));

app.get('/', function (req, res) {
    var contents = fs.readFileSync('index.html', 'utf-8');
    res.end(contents);
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
