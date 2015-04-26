var app = require('./app.js');
var PORT = 8000;

var server = app.listen(PORT,function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log("Server started on %s:%s",host,port);
});