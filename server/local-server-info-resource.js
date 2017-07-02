
var jsgui = require('../lang/lang'), os = require('os'), http = require('http'),
	libUrl = require('url'),
	Resource = require('../resource/resource');

var stringify = jsgui.stringify, each = jsgui.each, arrayify = jsgui.arrayify, tof = jsgui.tof;
var filter_map_by_regex = jsgui.filter_map_by_regex;
var Class = jsgui.Class, Data_Object = jsgui.Data_Object;
var fp = jsgui.fp, is_defined = jsgui.is_defined;
var Collection = jsgui.Collection;

var exec = require('child_process').exec;


/*
var Network_Interfaces = Collection.extend({
	'item_def': {'name': 'string', 'entries': [{'address': 'string', 'family': 'string', 'internal': 'boolean'}]}
});
*/

var local_server_info_fields = [
	//['name', 'string'],
	['networkInterfaces', Object], // was Network_Interfaces
	['status', 'string']
];
class Local_Server_Info extends Resource {
	// A network interfaces field.
	'constructor'(spec) {
		super(spec);
		// meta status.
		//this.meta.set('status', 'off');
		// could use a _ object with proxies.
		this.status = 'off';
	}
	// context needs to work properly in call multiple.. need to sort that out.
	//  may need to specify the calling object and the function.
	//  may not just be a pair.

	'start'(callback) {
        var that = this;
		super.start((err, res_start) => {
			if (err) {
				callback(err);
			} else {
                // collections responding to events in their objects?
                if (this.status === 'off') {
                    //that.meta.set('status', 'starting');
                    this.status = 'starting';

                    var getters = {
                        'net': (callback) => {
                            callback(null, os.networkInterfaces());
                        },
                        'cpus': (callback) => {
                            callback(null, os.cpus());
                        }
                    };
                    Object.assign(this.getters, getters);
                    that.status = 'on';
                    that.raise_event('started');
                    if (callback) {
                        //console.log('pre cb lsi');
                        callback(null, true);
                    }
					
                } else if (o_status == 'on') {
                    callback(null, true);
                }
			}
		});
	}
	'meets_requirements'() {
		return true;
	}
}

Local_Server_Info.prototype.fields = local_server_info_fields;
module.exports = Local_Server_Info;
