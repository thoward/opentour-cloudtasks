var express = require('express');
var app = express.createServer();

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
});

// user data storage
tasks = {}

// serve up our static index.html
app.get("/", function(req, res) {
  res.redirect("/index.html");
});

// return tasks for the specified user
app.get("/tasks/:userid", function(req, res) {

	var userid = req.params.userid;

	console.log("[GET] userid: " + userid);

	if (!(userid in tasks)) {
		tasks[userid] = [];
	}

	console.log("[GET] data: " + JSON.stringify(tasks[userid], null, 4));

	res.json(tasks[userid]);
});

// update tasks for the specified user
app.post("/tasks/:userid", function(req, res) {

	var userid = req.params.userid;

	console.log("[POST] userid: " + userid);
	console.log("[POST] data: " + JSON.stringify(req.body, null, 4));

	if(tasks[userid] !== undefined) {
		// update tasks
		tasks[userid] = (req.body["tasks"] || []).filter(retainedTasks);
	}

	res.send('');
});

// selector for tasks to retain
function retainedTasks(task) {
	return !("_destroy" in task);
}

app.listen(process.env.VCAP_APP_PORT || 3000);