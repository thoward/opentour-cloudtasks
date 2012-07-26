var express = require('express');
var uuid = require('node-uuid');

var app = express.createServer();

app.configure(function(){
  	app.use(express.cookieParser());
});

app.get('/', function(req, res) {

	if (req.cookies.userid === undefined) {        
        // no existing cookie, so create one
		var newId = uuid.v4();
		req.cookies['userid'] = newId;
		res.cookie('userid', newId, { maxAge: 900000, httpOnly: true});
	}

	res.json(req.cookies["userid"]);

});

app.listen(process.env.VCAP_APP_PORT || 3001);