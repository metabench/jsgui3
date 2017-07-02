/**
 * Created by James on 02/10/2016.
 */

var Server = require('../server/single-control-server');
var Start_Stop_Toggle_Button = require('../controls/start-stop-toggle-button');

//var Server = jsgui.Server;

var server = new Server({
	'port': 80,
	'ctrl': Start_Stop_Toggle_Button
});

server.start(function(err, cb_start) {
	if (err) {
		throw err;
	} else {
		console.log('server started');
	}
});