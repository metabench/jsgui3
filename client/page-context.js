
var jsgui = require('../html/html');

var stringify = jsgui.stringify, each = jsgui.each, arrayify = jsgui.arrayify, tof = jsgui.tof;
var filter_map_by_regex = jsgui.filter_map_by_regex;
var Class = jsgui.Class, Data_Object = jsgui.Data_Object, Enhanced_Data_Object = jsgui.Enhanced_Data_Object;
var fp = jsgui.fp, is_defined = jsgui.is_defined;
var Collection = jsgui.Collection;

var Client_Resource_Pool = require('./client-resource-pool');
var Selection_Scope = require('./selection-scope');
//console.log('jsgui.Page_Context', jsgui.Page_Context);


class Client_Page_Context extends jsgui.Page_Context {
    'constructor'(spec) {
        spec = spec || {};
        super(spec);
        //this.set('document', spec.document);
        this.document = spec.document || document;
        this.resource_pool = new Client_Resource_Pool({});

        this.map_els = {};


        // The item IDs could be handled here... use the local variable closure here.
        this.selection_scopes = {};

        this.selection_scope_id_counter = 0;

    }
    'new_selection_scope'() {
        // create the selection scope, with an assigned id

        var res = new Selection_Scope({
            'context': this,
            'id': this.selection_scope_id_counter++
        })

        return res;

    }
    'get_selection_scope_by_id'(id) {
        if (!this.selection_scopes[id]) {
            this.selection_scopes[id] = new Selection_Scope({
                'context': this,
                'id': id
            });
        }
        return this.selection_scopes[id];
    }
    'body'() {
        var doc = this.document;
        //console.log('doc', doc);

        //var bod = doc.childNodes[0].childNodes[1];

        // Gets the body control.

        var bod = doc.body;
        //var bod = doc.body;
        console.log('bod', bod);

        // Then need to see if a control exists.

        if (!this._body) {

            // Can we connect it through jsgui ids.

            var existing_jsgui_id = bod.getAttribute('jsgui-id');

            if (!existing_jsgui_id) {
                // Those don't use the enhancements...

                

                var ctrl_body = new jsgui.body({
                    'el': document.body,
                    'context': this
                });
                //ctrl_body.dom.el = bod;
                ctrl_body.dom.el.setAttribute('jsgui-id', ctrl_body._id());

                //var id = ctrl_body._id();

                //this.map_controls[id] = ctrl_body;

                this.register_control(ctrl_body);
                this._body = ctrl_body;
            }


            
            //console.log('ctrl_body._id()', ctrl_body._id());
            

        } else {

        }

        return this._body;



        // and if we don't have a body control, we need to make one.

        
        /*
        if (!bod) {
            // Need to create a new body control.

            // Possibly body control should have been made upon jsgui activation.

            


            // May need to activate it?


        } else {
            var bod_id = bod.getAttribute('data-jsgui-id');
            var res = this.map_controls[bod_id];
            //console.log('res', res);
            return res;
        }
        */

        //console.log('bod_id', bod_id);
        
    }
}
// Also want a File_Server.
//  Want files to be served from a particular path, as a resource in the URL system.
//  Will be able to post files there with the right permission.
module.exports = Client_Page_Context;