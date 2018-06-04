/**
 * Created by james on 04/12/2016.
 */

/**
 * Created by James on 02/10/2016.
 */

// This one will need to activate on the client.
//  Really want the whole thing to be in one file.
//  Possible to have a standard activation?
//
// Or we need to have a client-side control?
//
// Some of the wiring could be done automatically.
//

var jsgui = require('./server');
//var Start_Stop_Toggle_Button = require('../controls/start-stop-toggle-button');

var Server = jsgui.Server;
var Website_Resource = require('./website-resource');
var port = 80;
var Server_Page_Context = Server.Page_Context;

/*

var server = new Server({
    '*': {
        'name': 'html-server'
    }
});

*/




class Single_Control_Server extends Server {
    constructor(spec) {
        //spec['*'] = {
        //    'name': 'html-server'
        //};
        
        super(spec, 'single-control-server');
        //this.__type_name = 'single-control-server';

        var app = new Website_Resource({
            'name': 'html-server'
        });


        //console.log('app', app);
        //throw 'stop';
        this.resource_pool.add(app);
        this.server_router.set_route('*', app, app.process);

        this.Ctrl = spec.Ctrl || spec.ctrl;
        this.port = spec.port || 80;

    }
    'start'(callback) {
        var resource_pool = this.resource_pool;

        console.log('resource_pool', resource_pool);
        //throw 'stop';

        var server_router = resource_pool.get_resource('Server Router');
        var that = this;



//console.log('server_router', server_router);

        if (!server_router) {
            throw 'no server_router';
        }

        var routing_tree = server_router.routing_tree;

        routing_tree.set('/', function(req, res) {
            //console.log('root path / request');
            var server_page_context = new Server_Page_Context({
                'req': req,
                'res': res,
                'resource_pool': resource_pool
            });
            // Page_Bounds_Specifier
            var hd = new jsgui.Client_HTML_Document({
                'context': server_page_context
            });
            hd.include_client_css();
            hd.include_js('/js/app-bundle.js');
            var body = hd.body;
            var ctrl = new that.Ctrl({
                'context': server_page_context
            });
            //var ctrl2 = new jsgui.Control({});
            body.add(ctrl);
            hd.all_html_render(function(err, deferred_html) {
                if (err) {
                    throw err;
                } else {
                    //console.log('deferred_html', deferred_html);
                    var mime_type = 'text/html';
                    //console.log('mime_type ' + mime_type);
                    res.writeHead(200, { 'Content-Type': mime_type });
                    res.end('<!DOCTYPE html>' + deferred_html, 'utf-8');
                }
            });
        });



        super.start(this.port, (err, res_super_start) => {
            if (err) {
                callback(err);
            } else {
                console.log('res_super_start', res_super_start);
                callback(null, res_super_start);



            }
        });


       // console.log('this.port', this.port);



    }



}


module.exports = Single_Control_Server;

// Rendering single page controls makes a lot of sense.
//  It means the activation code can be contained better there.

//console.log('resource_pool', resource_pool);
//console.log('resource_pool.resources', resource_pool.resources);

// The start stop toggle button would need to be registered on the client side.
//  May be worth it to have the standard controls registered to start with.
//  Or to have the app know which controls are used, so it can register them.

// Get the website resource



// Caching items / resources by type?

// Need to give the resources a name.


//var website = resource_pool.get_resource('Server Router');

//console.log('\n\n');
