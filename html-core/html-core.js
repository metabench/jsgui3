/**
 * Created by James on 16/09/2016.
 */
//"use strict";
var jsgui = require('../lang/lang');
var str_arr_mapify = jsgui.str_arr_mapify;
var get_a_sig = jsgui.get_a_sig;
var each = jsgui.each;
var Control = jsgui.Control = require('./control-enh');
var tof = jsgui.tof;
var map_Controls = jsgui.map_Controls = {};

var core_extension = str_arr_mapify(function (tagName) {
    jsgui[tagName] = class extends Control {
        'constructor' (spec) {
            //spec.tagName = tagName;
            //console.log('core extension tagName ' + tagName);
            super(spec);

            //this.get('dom').set('tagName', tagName);

            this.dom.tagName = tagName;
            // dom.tagName?

        }
    };

    jsgui[tagName].prototype._tag_name = tagName;
    map_Controls[tagName] = jsgui[tagName];
});

var core_extension_no_closing_tag = str_arr_mapify(function (tagName) {
    jsgui[tagName] = class extends Control {
        'constructor' (spec) {
            //spec.tagName = tagName;

            //console.log('core extension tagName ' + tagName);

            super(spec);

            //this.get('dom').set('tagName', tagName);

            this.dom.tagName = tagName;
            this.dom.noClosingTag = true;
            // dom.tagName?

        }
    };
    jsgui[tagName].prototype._tag_name = tagName;
    map_Controls[tagName] = jsgui[tagName];
});


var recursive_dom_iterate = function (el, callback) {
    //console.log('recursive_dom_iterate');
    callback(el);

    //console.log('tof(el.childNodes) ' + tof(el.childNodes));

    //each(el.childNodes, function(i, v) {
    //	console.log('v ' + v);
    //});

    //console.log('el.childNodes.length ' + el.childNodes.length);
    var cns = el.childNodes;
    //console.log('el', el);
    //console.log('cns.length', cns.length);
    for (var c = 0, l = cns.length; c < l; c++) {
        recursive_dom_iterate(cns[c], callback);
    }
}

var recursive_dom_iterate_depth = function (el, callback) {
    //console.log('recursive_dom_iterate');


    //console.log('tof(el.childNodes) ' + tof(el.childNodes));

    //each(el.childNodes, function(i, v) {
    //  console.log('v ' + v);
    //});

    //console.log('el.childNodes.length ' + el.childNodes.length);
    var cns = el.childNodes;
    for (var c = 0, l = cns.length; c < l; c++) {
        recursive_dom_iterate_depth(cns[c], callback);
    }
    callback(el);
}


// Want the document node to be linked with the context when activated (automatically)

// We find the html element control. That is the one that gets set to be the context's ctrl_document.




var activate = function (context) {
    // The context should already have the map of controls.

    // Not so sure we can have the client page context here - does it use resources?

    //ensure_Context_Menu_loaded(function(_Context_Menu) {
    //Context_Menu = _Context_Menu;
    if (!context) {
        throw 'jsgui-html-enh activate(context) - need to supply context parameter.';
    }
    //context = context || new Page_Context();
    //console.log('jsgui-html-enh activate context', context);

    var map_jsgui_els = {};
    var map_jsgui_types = {};
    //console.log('activate - beginning mapping');
    // Could put together the array of controls in order found.

    var arr_controls = [];
    // element registration
    // Recursive iteration where the innermost get called first....
    //  Would be useful here.
    // counting up the typed id numbers.

    var max_typed_ids = {};

    var id_before__ = function (id) {
        var pos1 = id.lastIndexOf('_');
        var res = id.substr(0, pos1);
        return res;
    }

    var num_after = function (id) {
        //var pos1 = id.lastIndexOf('_');
        //var res = parseInt(id.substr(pos1 + 1), 10);
        //return res;
        return parseInt(id.substr(id.lastIndexOf('_') + 1), 10);
    }

    recursive_dom_iterate(document, function (el) {

        //console.log('recursive_dom_iterate el', el);
        //console.log('tof el', tof(el));
        //console.log('2) el.tagName ' + el.tagName);
        var nt = el.nodeType;
        //console.log('nt ' + nt);

        // So for the 'HTML' tag name...
        //  We should make a control for the HTML document - or it should get activated.



        if (nt == 1) {
            var jsgui_id = el.getAttribute('data-jsgui-id');
            // Give the HTML document an ID?


            //console.log('jsgui_id ' + jsgui_id);
            if (jsgui_id) {
                var ib = id_before__(jsgui_id);
                var num = num_after(jsgui_id);
                if (!max_typed_ids[ib]) {
                    max_typed_ids[ib] = num;
                } else {
                    if (num > max_typed_ids[ib]) max_typed_ids[ib] = num;
                }

                map_jsgui_els[jsgui_id] = el;
                var jsgui_type = el.getAttribute('data-jsgui-type');
                //console.log('jsgui_type ' + jsgui_type);
                map_jsgui_types[jsgui_id] = jsgui_type;
                //console.log('jsgui_type ' + jsgui_type);
            }
        }
    });
    context.set_max_ids(max_typed_ids);
    var map_controls = context.map_controls;
    // Control construction and registration
    each(map_jsgui_els, function (el, jsgui_id) {
        //console.log('jsgui_id ' + jsgui_id);
        //console.log('3) el.tagName ' + el.tagName);
        var l_tag_name = el.tagName.toLowerCase();
        if (jsgui_id) {
            var type = map_jsgui_types[jsgui_id];
            //console.log('type ' + type);
            //var cstr = jsgui.constructor_from_type(type);

            //var cstr = jsgui.constructor_from_type(type);
            //console.log('!!map_controls[jsgui_id]', !!map_controls[jsgui_id]);

            //console.log('cstr ' + cstr);

            // use the context's map_Controls

            // Should it look to see if the control has already been constructed?
            //  On the client side, we may want to check against an index of pre-existing controls.

            //if (!)

            //console.log('map_controls', map_controls);

            if (!map_controls[jsgui_id]) {
                // Only construct it if it does not exist already.

                var Cstr = context.map_Controls[type];
                //console.log('type', type);
                //console.log('!!Cstr', !!Cstr);

                if (Cstr) {
                    //console.log('arr_controls.length', arr_controls.length);
                    //console.log('!!map_controls[jsgui_id]', !!map_controls[jsgui_id]);

                    //console.log('3) jsgui_id', jsgui_id);

                    //console.log('creating constructor of type', type, 'jsgui_id', jsgui_id);

                    // Would re-apply the constructors?

                    var ctrl = new Cstr({
                        'context': context,
                        '_id': jsgui_id,
                        'el': el
                    });

                    arr_controls.push(ctrl);

                    //console.log('el.tagName', el.tagName);

                    if (l_tag_name === 'html') {
                        //console.log('el is document root el');

                        // The html element represents the root of a document.
                        //throw '2) stop';

                        context.ctrl_document = ctrl;
                    }

                    map_controls[jsgui_id] = ctrl;
                } else {
                    console.log('Missing context.map_Controls for type ' + type + ', using generic Control');
                    var ctrl = new Control({
                        'context': context,
                        '_id': jsgui_id,
                        'el': el
                    })
                    //map_controls[jsgui_id] = ctrl;

                    ctrl.__type_name = type;
                    arr_controls.push(ctrl);

                    map_controls[jsgui_id] = ctrl;

                }



            } else {
                //console.log('found control in map', jsgui_id);
                var ctrl = map_controls[jsgui_id];
                ctrl.dom.el = el;

                // Attach the DOM events.

                // This should only attach the DOM events that are already there.

                if (ctrl.attach_dom_events) ctrl.attach_dom_events();


            }






            //console.log('jsgui_id ' + jsgui_id);
            //console.log('ctrl._id() ' + ctrl._id());

        }
        // get the constructor from the id?
    });

    recursive_dom_iterate_depth(document, function (el) {
        //console.log('el ' + el);
        var nt = el.nodeType;
        //console.log('nt ' + nt);
        if (nt == 1) {
            var jsgui_id = el.getAttribute('data-jsgui-id');
            //console.log('* jsgui_id ' + jsgui_id);
            if (jsgui_id) {

                //console.log('map_controls', map_controls);

                var ctrl = map_controls[jsgui_id];
                //console.log('!!ctrl', !!ctrl);
                ctrl.__activating = true;


                //console.log('tof ctrl ' + tof(ctrl));
                //console.log('ctrl.__type_name', ctrl.__type_name);
                //console.log('ctrl', ctrl);
                ctrl.activate();

                // Type name being set in initialization?


                ctrl.__activating = false;
                //console.log('jsgui_type ' + jsgui_type);
            }
        }
    });

};

var escape_html_replacements = [
    [/&/g, '&amp;'],
    [/</g, '&lt;'],
    [/>/g, '&gt;'],
    [/"/g, '&quot;'], //"
    [/'/g, '&#x27;'], //'
    [/\//g, '&#x2F;']
];
//var single_replacement;

var escape_html = function (str) {

    //console.log('tof(str) ' + tof(str));

    //console.log('escape_html str ' + str);
    //console.log('tof str ' + tof(str));

    if (tof(str) == 'data_value') str = str.get();

    var single_replacement;
    for (var c = 0, l = escape_html_replacements.length; c < l; c++) {
        single_replacement = escape_html_replacements[c]
        str = str.replace(single_replacement[0], single_replacement[1]);
    }
    //each(escape_html_replacements, function (i, v) {
    //    str = str.replace(v[0], v[1]);
    //});

    return str;
};





jsgui.activate = activate;
core_extension('html head title body div span h1 h2 h3 h4 h5 h6 label p a script button form img ul li audio video table tr td caption thead colgroup col');
core_extension_no_closing_tag('link input');


// Activated so it can listen for a change in the text?
class textNode extends Control {
    'constructor' (spec) {
        super(spec);
        spec = spec || {};
        if (typeof spec == 'string') {
            //this._.text = spec;
            //this.innerHtml = spec;
            spec = {
                'text': spec
            };
        }

        spec.nodeType = 3;

        //ctrl_init_call(this, spec);

        //this._super(spec);

        // the underscore properties could make sense in Data_Objects and controls.
        //  have the getters and setters that change the property and also raise the change event.

        // Proxies seem like a possibility to listen for such changes.
        //  However, we would make the changes to the proxy object.
        //  Possibly could have something that raises a change event.

        // Proxies could get trickier when they are in the object heirachy.

        this._ = {};





        if (typeof spec.text != 'undefined') {
            this.text = spec.text;
        }

        //this.typeName = pr.typeName;
        //this.tagName = 'p';

    }
    get text() {
        return this._.text;
    }
    set text(value) {
        this._.text = value;
        this.raise('change', {
            'name': 'text',
            'value': value
        });
    }
    'all_html_render' () {
        // need to escape the HTML it outputs.
        var res;

        //var text = this._.text || '';
        //var text = this.get('text');
        // These get and set operations should not rely on the page_context.

        //console.log('text ' + text);

        //var nx = this.get('no_escape');

        //console.log('nx ' + nx);

        if (this.nx) {
            res = this.text || '';
        } else {
            res = escape_html(this.text || '') || '';
        }

        return res;
    }

    // getter and setter for the text itself?
    //  A variety of properties will use getters and setters so that the updates get noted.





};

class HTML_Document extends jsgui.Control {
    // no tag to render...
    //  but has dtd.
    'constructor' (spec) {
        super(spec);
    }

    'render_dtd' () {
        return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n';
    }


}



class Blank_HTML_Document extends HTML_Document {
    'constructor' (spec) {
        //console.log('super', typeof super);
        //console.log('Blank_HTML_Document');

        //HTML_Document.prototype.constructor.call(this, spec);
        super(spec);

        var context = this.context;
        //console.log('context ' + context);

        if (!spec.el) {
            this.dom.tagName = 'html';
            var head = new jsgui.head({
                'context': context
            });
            this.content.add(head);

            var title = new jsgui.title({
                'context': context
            });
            head.content.add(title);

            var body = new jsgui.body({
                'context': context
            });
            this.content.add(body);

            // and have .head, .title, .body?

            // useful shortcuts?
            //this.set('head', head);
            //this.set('title', title);
            //this.set('body', body);

            this.head = head;
            this.title = title;
            this.body = body;

            // Maybe connecting control fields?
            //this.connect_fields(['head', 'body', 'title']);
        }



        //console.log('content ' + stringify(this.content));

        //throw 'stop';

        //console.log('');
        //console.log('end init Blank_HTML_Document this._ ' + stringify(this._));
    }
    'body' () {
        //console.log('body sig', sig);
        var a = arguments;
        a.l = arguments.length;
        var sig = get_a_sig(a, 1);
        if (sig == '[]') {
            // find the body control.

            var content = this.content;
            //console.log('content', content);
            var body = content.get(1);
            //console.log('body', body);
            //throw 'stop';

            return body;
        }
    }
};

// Want a body function in other nodes, available throughout the document?



class Client_HTML_Document extends Blank_HTML_Document {
    'constructor' (spec) {
        //console.log('Client_HTML_Document');
        super(spec);
        //spec.context.ctrl_document = this;
        this.active();

    }

    'include_js' (url) {
        var head = this.get('head');
        // create jsgui.script
        var script = new jsgui.script({
            //<script type="text/JavaScript" src="abc.js"></script>
            'context': this.context
        })
        // <script data-main="scripts/main" src="scripts/require.js"></script>
        var dom = script.dom;
        //console.log('* dom ' + stringify(dom));
        //var domAttributes = script.get('dom.attributes');
        var domAttributes = dom.attributes;
        //console.log('domAttributes ' + domAttributes);

        //domAttributes.set('type', 'text/javascript');
        //domAttributes.set('src', '/js/require.js');
        //domAttributes.set('src', url);

        domAttributes.type = 'text/javascript';
        domAttributes.src = url;



        head.content.add(script);
    }

    'include_css' (url) {
        var head = this.get('head');
        // create jsgui.script
        // <link rel="stylesheet" type="text/css" href="theme.css">

        var link = new jsgui.link({
            //<script type="text/JavaScript" src="abc.js"></script>
            'context': this.context
        })
        // <script data-main="scripts/main" src="scripts/require.js"></script>
        var dom = link.dom;
        //console.log('* dom ' + stringify(dom));
        //var domAttributes = script.get('dom.attributes');
        var domAttributes = dom.attributes;
        //console.log('domAttributes ' + domAttributes);

        domAttributes['rel'] = 'stylesheet';
        domAttributes['type'] = 'text/css';
        //domAttributes.set('src', '/js/require.js');
        domAttributes['href'] = url;
        head.content.add(link);
    }


    'include_jsgui_client' (js_file_require_data_main) {
        // Could add the default client file.
        // Or a specific client file with a control that also has client-side code.
        //  The client-side code won't get processed on the server.
        //  There will be a specific place where client side code gets called upon activation.
        // could include a specific parameter for js_file_require_data_main

        js_file_require_data_main = js_file_require_data_main || '/js/web/jsgui-html-client';

        // Needs to add various script references to the body.
        //  May just be one client.js file
        //  Then will work on having it build quickly
        //  Then will work on making it stay fast to build and be smaller.

        // include the script in the body?
        //  is there a way to keep it at the end of the body?
        //  could put it in the head for the moment.

        var head = this.head;
        // create jsgui.script

        var script = new jsgui.script({
            //<script type="text/JavaScript" src="abc.js"></script>
            'context': this.context
        })
        // <script data-main="scripts/main" src="scripts/require.js"></script>

        //var dom = script.get('dom');
        //console.log('* dom ' + stringify(dom));

        //var domAttributes = script.get('dom.attributes');
        //var domAttributes = dom.get('attributes');
        var domAttributes = script.dom.attributes;

        domAttributes.set({
            'type': 'text/javascript',
            'src': '/js/web/require.js',
            'data-main': js_file_require_data_main
        });

        head.add(script);
        //throw 'stop';

    }

    'include_jsgui_resource_client' (path) {

        // Could add the default client file.

        // Or a specific client file with a control that also has client-side code.
        //  The client-side code won't get processed on the server.
        //  There will be a specific place where client side code gets called upon activation.

        // could include a specific parameter for js_file_require_data_main

        var js_file_require_data_main = path || '/js/web/jsgui-html-resource-client';
        this.include_jsgui_client(js_file_require_data_main);

    }
    'include_client_css' () {
        var head = this.get('head');
        var link = new jsgui.link({
            //<script type="text/JavaScript" src="abc.js"></script>
            'context': this.context

        });
        //var lda = link.get('dom.attributes');
        //var dom = link.get('dom');
        //console.log('* dom ' + stringify(dom));

        //var domAttributes = script.get('dom.attributes');
        var domAttributes = link.dom.attributes;

        // link.dom.attrs
        //domAttributes.set('rel', 'stylesheet');
        //domAttributes.set('type', 'text/css');
        //domAttributes.set('href', '/css/basic.css');

        domAttributes.rel = 'stylesheet';
        domAttributes.type = 'text/css';
        domAttributes.href = '/css/basic.css';


        head.content.add(link);
        // <link rel="stylesheet" type="text/css" href="theme.css">
    }
    // also need to include jsgui client css
}

jsgui.textNode = textNode;
jsgui.HTML_Document = HTML_Document;
jsgui.Blank_HTML_Document = Blank_HTML_Document;
jsgui.Client_HTML_Document = Client_HTML_Document;
jsgui.Page_Context = require('./../html-core/page-context');


// And load in all or a bunch of the controls.

// Can we require all of the controls at once, and then merge them?




//jsgui.Toggle_Button =




module.exports = jsgui;