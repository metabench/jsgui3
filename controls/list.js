/*
 if (typeof define !== 'function') { var define = require('amdefine')(module) }

 define(["../../jsgui-html", "./item"],
 function(jsgui, Item) {
 */

var jsgui = require('../html-core/html-core');
var Item = require('./item');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;
var Collection = jsgui.Collection;

// will have a context menu by default

class List extends Control {

    // Items collection as a field?
    //  This would have control content items.
    //  It would / may also have a Collection of items.
    //  It would get given its items as JSON / a JS object / array, and then would create the content Controls.

    // Want it to be easy to create a list, give it the data or the data source.

    /*
     'fields': [
     //['text', String]
     ['toggle_button', Control],
     ['inner_control', Control],
     ['expander', Control]

     ],
     */

    constructor(spec, add, make) {
        // Wont fields have been set?
        console.log('init list');

        super(spec);
        var that = this;

        // Can take an image
        // Can take some text.
        //  That's all I'll have in the tree node for now.
        this.__type_name = 'list';
        //this.dom.attributes.class', 'list');
        this.add_class('list');
        // a Collection of items.
        // Collection not needing a Context?
        //  Having all Data_Objects and Collections require a context seems too much.
        //  Context seems important in the case of Controls.
        this.items = new Collection();
        //this.set('items', coll_items);
        //console.log('spec.items', spec.items);
        //throw 'stop';
        if (spec.items) {
            //this.items.set(spec.items);
            this.items = spec.items;
        }

        // The list spec could also take info about how to display the items.

        // And create a new item control for each item.
        //  I think an 'item' control could be quite useful. Shows some data.
        //   Won't be too big, but will be flexible in what it can do.

        // Will take some JSON, and render it using sensible defaults.
        //  Eg name first and in bold.
        //  Maybe key
        //

        // A general purpose item control will be quite useful.
        //  Item will be fairly general purpose, and much of the purpose of using it is to show intent rather than because of
        //  an 'item' doing particular things. It just is. It will be like a control, except it's generally used for rendering some particular data.
        // Want the Item and the List to be convenient UI components. They need to make it simple to represent some data.
        //  Items and Lists could potentially use templates to quickly render data.

        each(this.items, item => {
            //console.log('item', item);

            var ctrl_item = new Item({
                'context': this.context,
                'value': item
            });

            this.add(ctrl_item);
        });

        // listen for changes to the list. represent those changes in the UI controls. Then these get automatically changed in the DOM by other code.


        // This is where a Collection could help a lot.
        /*

        this.items.on('change', (evt_change) => {
            //console.log('evt_change', evt_change);
            if (evt_change.type === 'insert') {
                var ctrl_item = new Item({
                    'context': this.context,
                    'value': evt_change.item
                });

                this.add(ctrl_item);
            }
        });
        */




        if (!this._abstract && !spec.el) {


        }
    }

    'activate'() {
        super.activate();
        // put the context menu in place.
        //throw 'stop';

        // Not all lists need context menus.

        /*

        this.context_menu({
            'Delete': function() {
                console.log('context_menu Delete');

                // need to actually delete it if possible?

            },
            'Edit': function() {
                console.log('context_menu Edit');
                // need to actually delete it if possible?
            }
        });
        */

        // Need to listen for new items being added.
        //  (Changes being made)



    }
}
module.exports = List;