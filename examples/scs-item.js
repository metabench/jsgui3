/**
 * Created by James on 02/10/2016.
 */

const Server = require('../server/single-control-server');
const File_Tree = require('../controls/file-tree');
const Month_View = require('../controls/month-view');

//var Server = jsgui.Server;

// Want to give it the js to include?
//  Include jsgui client js as default.
//  Would maybe want to substitute that with a different client build that includes jsgui3 (client) and custom controls and logic.


// Give it a live Control?
//  Would want to give that Control access to a server-side resource too.


var server = new Server({
	'port': 80,
	'ctrl': Month_View
});

server.start(function(err, cb_start) {
	if (err) {
		throw err;
	} else {
		console.log('server started');
	}
});