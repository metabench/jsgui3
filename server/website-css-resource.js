/*
 if (typeof define !== 'function') {
 var define = require('amdefine')(module);
 }

 define(['module', 'path', 'fs', 'url', '../../web/jsgui-html', 'os', 'http', 'url', './resource',
 '../../web/jsgui-je-suis-xml', 'cookies', '../../fs/jsgui-node-fs2-core'],

 function(module, path, fs, url, jsgui, os, http, libUrl,
 Resource, JeSuisXML, Cookies, fs2) {
 */

var path = require('path'),
	fs = require('fs'),
	url = require('url'),
	jsgui = require('../html/html'),
	os = require('os'),
	http = require('http'),
	libUrl = require('url'),
	Resource = require('../resource/resource'),
	Cookies = require('cookies'),
	fs2 = require('./fs2');



var stringify = jsgui.stringify,
	each = jsgui.each,
	arrayify = jsgui.arrayify,
	tof = jsgui.tof;
var filter_map_by_regex = jsgui.filter_map_by_regex;
var Class = jsgui.Class,
	Data_Object = jsgui.Data_Object,
	Enhanced_Data_Object = jsgui.Enhanced_Data_Object;
var fp = jsgui.fp,
	is_defined = jsgui.is_defined;
var Collection = jsgui.Collection;

// Extends AutoStart_Resource?

// May need to change around a fair few references to make it workable.
// May need some more complicated logic to change it to the path for service.



var serve_css_file_from_disk = function (filePath, response) {

	// look for the file in two places.
	// look within the project
	// look within jsgui

	// Checking if a file exists is not recommended.
	//  Possible race condition where exists checks and sees it's there, something else deletes it, then try to open the file thinking that it exists.
	//  Now recommended to open the file and handle error if it does not exist.

	//


	var file_path_in_project = filePath;

	// And also need to work outs path within the ws system.


	let attempt_load = (path, callback) => {
		fs2.load_file_as_string(path, function (err, data) {
			if (err) {
				//console.log('could not open file jsgui_css_file_path', jsgui_css_file_path);

				//jsgui_css_file_path = '../../' + filePath;
				//console.log('jsgui_css_file_path', jsgui_css_file_path);
				callback(null, false);
			} else {
				callback(null, data);

			}

		});
	}

	// 

	let candidate_paths = ['../css/' + filePath, '../../css/' + filePath, './css/' + filePath, './' + filePath, '../../ws/' + filePath, '../../../' + filePath];

	let c = 0,
		l = candidate_paths.length,
		spath;



	let go = () => {
		if (c < l) {
			spath = candidate_paths[c];
			//console.log('spath', spath);
			let rpath = path.resolve(spath);
			//console.log('rpath', rpath);




			attempt_load(spath, (err, res_load) => {
				if (res_load === false) {
					c++;
					go();
				} else {
					next(null, res_load);
				}
			});

			//c++;
			//go();
		} else {
			next(null, false);
		}

	}
	go();

	let next = (err, css) => {
		//console.log('css', css);

		if (css !== false) {
			//console.log('css', css);
			response.writeHead(200, {
				'Content-Type': 'text/css'
			});
			response.end(css);


		} else {
			console.log('could not load css', filePath);

			// serve a 404?

			response.writeHead(404, {
				"Content-Type": "text/plain"
			});
			response.write("404 Not Found\n");
			response.end();
		}
	}




	/*

	fs2.load_file_as_string(filePath, function (err, data) {
			if (err) {
				//console.log('could not open file filePath', filePath);
				// Try to open it from within the app's path.
				// ../../../ + filePath

				// Could try some different CSS paths
				//var jsgui_css_file_path = '../jsgui/' + filePath;


				// Will attempt various paths from the current directory, looking for that file.
				//  Could be improved promises / observable syntax.

				var jsgui_css_file_path = './' + filePath;




			}




			console.trace();

			var jsgui_css_file_path = '../../ws/' + filePath;
			// can try some other paths too...

			console.log('jsgui_css_file_path', jsgui_css_file_path);

			fs2.load_file_as_string(jsgui_css_file_path, function (err, data) {
				if (err) {
					//console.log('could not open file jsgui_css_file_path', jsgui_css_file_path);

					jsgui_css_file_path = '../../' + filePath;
					console.log('jsgui_css_file_path', jsgui_css_file_path);

					// can try some other paths too...

					fs2.load_file_as_string(jsgui_css_file_path, function (err1, data) {
						if (err1) {
							//console.log('could not open file jsgui_css_file_path', jsgui_css_file_path);

							// Try three paths back...
							jsgui_css_file_path = '../../../' + filePath;
							console.log('jsgui_css_file_path', jsgui_css_file_path);

							fs2.load_file_as_string(jsgui_css_file_path, function (err2, data) {
								if (err2) {
									//console.log('could not open file jsgui_css_file_path', jsgui_css_file_path);
									// Try three paths back...

									// Try to open it from within the app's path.
									// ../../../ + filePath

									//var jsgui_css_file_path = '../../../' + filePath;

									//throw err2;

									console.log('filePath', filePath);

									jsgui_css_file_path = '../../' + filePath;
									console.log('jsgui_css_file_path', jsgui_css_file_path);

									fs2.load_file_as_string(jsgui_css_file_path, function (err3, data) {
										if (err3) {
											//console.log('could not open file jsgui_css_file_path', jsgui_css_file_path);

											// Try three paths back...
											// Try to open it from within the app's path.
											// ../../../ + filePath

											//var jsgui_css_file_path = '../../../' + filePath;

											throw err2;
										} else {
											//var servableJs = updateReferencesForServing(data);
											response.writeHead(200, {
												'Content-Type': 'text/css'
											});
											response.end(data);
										}
									});
								} else {
									//var servableJs = updateReferencesForServing(data);
									response.writeHead(200, {
										'Content-Type': 'text/css'
									});
									response.end(data);
								}
							});
							// Try to open it from within the app's path.
							// ../../../ + filePath

							//var jsgui_css_file_path = '../../../' + filePath;
							//throw err;
						} else {
							//var servableJs = updateReferencesForServing(data);
							response.writeHead(200, {
								'Content-Type': 'text/css'
							});
							response.end(data);
						}
					});
					// Try to open it from within the app's path.
					// ../../../ + filePath

					//var jsgui_css_file_path = '../../../' + filePath;
					//throw err;
				} else {
					//var servableJs = updateReferencesForServing(data);
					response.writeHead(200, {
						'Content-Type': 'text/css'
					});
					response.end(data);
				}
			});


			//throw err;
		} else {
			//var servableJs = updateReferencesForServing(data);
			response.writeHead(200, {
				'Content-Type': 'text/css'
			});
			response.end(data);
		}
	});

	*/
}


class Site_CSS extends Resource {

	constructor(spec) {
		super(spec);

		//this.meta.set('custom_paths', new Data_Object({}));
		this.custom_paths = new Data_Object({});
		// Those are custom file paths.

		// could have a collection of directories, indexed by name, that get served.

		// Index the collection by string value?
		//this.meta.set('served_directories', new Collection({'index_by': 'name'}));
		this.served_directories = new Collection({
			'index_by': 'name'
		});

	}
	'start' (callback) {
		callback(null, true);
	}
	'serve_directory' (path) {
		// Serves that directory, as any files given in that directory can be served from /js
		var served_directories = this.served_directories;
		//console.log('served_directories ' + stringify(served_directories));
		//served_directories.push(path);

		// May also want to serve a directory under a different path.



		served_directories.push({
			'name': path
		});
		//console.log('served_directories ' + stringify(served_directories));
		//console.log('path ' + path);


		//throw 'stop';



	}
	'process' (req, res) {
		//console.log('Site_CSS processing HTTP request');
		var remoteAddress = req.connection.remoteAddress;

		var custom_paths = this.custom_paths;

		var rurl = req.url;

		var pool = this.pool;
		// should have a bunch of resources from the pool.

		//var pool_resources = pool.resources();
		//console.log('pool_resources ' + stringify(pool_resources));


		var url_parts = url.parse(req.url, true);
		//console.log('url_parts ' + stringify(url_parts));
		var splitPath = url_parts.path.substr(1).split('/');
		//console.log('resource site css splitPath ' + stringify(splitPath));


		if (rurl.substr(0, 1) == '/') rurl = rurl.substr(1);
		rurl = rurl.replace(/\./g, '☺');
		//console.log('rurl ' + rurl);

		var custom_response_entry = custom_paths[rurl];
		//console.log('custom_response_entry ' + stringify(custom_response_entry));

		if (custom_response_entry) {
			var tcr = tof(custom_response_entry);
			//console.log('tcr ' + tcr);

			//throw 'stop';

			if (tcr == 'data_value') {
				var val = custom_response_entry.value();
				console.log('val ' + val);
				throw 'stop';
				var tval = tof(val);
				if (tval == 'string') {
					// then it should be a local file path, serve it.
					serve_css_file_from_disk(val, res);
				}
			}
		} else {
			if (splitPath.length > 0) {
				if (splitPath[0] === 'css') {
					if (splitPath.length > 1) {
						if (splitPath.length == 2) {
							var fileName = splitPath[1];
							//var filePath = 'css/' + fileName;
							serve_css_file_from_disk(fileName, res);
						} else {
							if (splitPath.length === 3) {


							}

						}
					}
				}

			}
		}
	}
}


//return Site_CSS;


//});
module.exports = Site_CSS;