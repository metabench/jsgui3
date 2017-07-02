var jsgui = require('../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;
var Data_Value = jsgui.Data_Value;

//var Data_Object = jsgui.Data_Object;

class Item extends Control {

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


    // Also want it to be easy to include images, by key.
    //  Item could make use of an Image control.
    //  Image will enable the presentation at different sizes.
    //   Thumbnail will extend Image.

    // Both of them will refer to the Website Image Resource.
    //  Client side, they will act differently.
    //  Should be possible to download a different image, but maybe will require a client-side image index.
    // Will do more work on accessing server resources from the client in a convenient way.








    'constructor'(spec, add, make) {
        super(spec);
        this.__type_name = 'item';
        //this.add_class('item');

        this.add_class('item');

        // Would have a Value.
        //  I think that should be a Data_Object.

        // I think one pattern of the Item will be as follows:
        //  Create Item, give JSON data.
        //  Listen for a change in the item.
        //   UI change, item event called, new data provided / available.
        // Item would create an automatic Model (I think).

        // -----
        // Item could be presented with a data source that has a change event.
        //  Item listens to the change event, and changes with it.

        // With a few fairly versitile classes:
        // Data_Object, Collection, Data_Value
        //  and
        // List, Item
        // We will be able to represent a wide variety of data, and have it editable within an MVC system.


        // Anyway, just want to display some data for the moment.
        // Or is spec.value a function

        //console.log('spec.value', spec.value);
        //console.log('t spec.value', tof(spec.value));


        //var value = new Data_Object({});

        // Defining a Data_Object, using another Data_Object as the paraneter...
        //  Need to do some more work on this.


        // A Data_Object with another Data_Object as its constructor.
        //  Clone makes the most sense. Construct by value.

        //var value = new Data_Object(spec.value);

        // An item could have a key as well as a value, or be a compound item.
        //  May have a picture, icon or caption.
        //  So it's a vague word but all the things in the item are grouped together relevant to it.

        var value = this.value = spec.value || spec.item;

        this.states = ['closed', 'open'];
        this.state = new Data_Value('closed');
        this.i_state = 0;

        var active_fields = this.active_fields = {};
        active_fields.states = this.states;
        active_fields.state = this.state;
        active_fields.i_state = this.i_state;

        var that = this;

        //this.set('value', value);

        // Set Data_Object using another Data_Object?
        //  I think it should copy that Data_Object's various values.
        //  Clone it's ._ if possible.
        //   Except there could be more Data_Objects and Collections there.
        //    Possibly need to add .clone code to Data_Object and Collection.

        //console.log('spec.items', spec.items);
        //throw 'stop';

        //if (spec.value) {
        //    value.set(spec.value);
        //}

        // And we need to render the value.

        //console.log('value', value);

        // Break this down into composition stage?
        if (!spec.abstract && !spec.el) {
            
            var ctrl_primary = new Control({
                'context': this.context
            });
            this.add(ctrl_primary);

            var set_value = function(value) {
                var t_value = tof(value);

                if (t_value === 'collection') {
                    //console.log('collection value', value);
                    set_value(value._arr[0]);

                    //console.log('tof(value._arr[1])', tof(value._arr[1]));

                    if (tof(value._arr[1]) === 'function') {

                        //console.log('adding on click');

                        // The problem is, we don't have an element right now.
                        //  Need to assign this click event to the DOM once it gets an element.
                        //  It has not been rendered yet, so once it gets rendered and put in the DOM, it still needs to have its DOM events attached.
                        

                        that.on('click', value._arr[1]);
                        
                    }

                } else if (t_value === 'data_value') {
                    ctrl_primary.add(value.value());
                } else if (t_value === 'string' || t_value === 'number') {
                    ctrl_primary.add(value);
                } else if (value.keys) {
                    var value_keys = value.keys();
                    //console.log('value_keys', value_keys);
                    var map_keys = mapify(value_keys);
                    //console.log('map_keys', map_keys);

                    var has_id = map_keys['id'];
                    var has_name = map_keys['name'];
                    var has_key = map_keys['key'];
                    var id, name, key;

                    if (has_id && has_key && !has_name) {
                        id = value.id;
                        key = value.key;

                        //console.log('id', id);
                        //c/onsole.log('key', key);

                        var ctrl_id = new Control({
                            'context': this.context
                        });
                        //ctrl_id.set('dom.attributes.class', 'id');
                        ctrl_id.add_class('id');
                        var ctrl_key = new Control({
                            'context': this.context
                        });
                        //ctrl_key.set('dom.attributes.class', 'key');
                        ctrl_id.add_class('key');

                        // Will possibly have more code to do with rendering Data_Values as HTML, as Control content.

                        ctrl_id.add(id.value);
                        ctrl_key.add(key.value);

                        ctrl_primary.add(ctrl_id);
                        ctrl_primary.add(ctrl_key);

                    }
                }

            }
            set_value(value);

            //var ctrl_secondary = new Control({
            //    'context': this.context
            //})
            
        
        




             

            this.inner = new Control({
                'context': this.context,
                'class': 'inner hidden'
            })
            this.add(this.inner);

            // Treating all of the inner items as fields in some way?




            // Updating the control fields to include all of the inner items?
            //  Maybe do that immediately prior to rendering, as an optimization.



            var ctrl_fields = {
                'inner': this.inner._id()
            }

            // And then an array of items?
            //  Need to activate the inner items in a heirachy of items too.


            this.dom.attrs['data-jsgui-fields'] = stringify(active_fields).replace(/"/g, "'");

            //this.set('dom.attributes.data-jsgui-ctrl-fields', stringify(ctrl_fields).replace(/"/g, "'"));
            this.dom.attrs['data-jsgui-ctrl-fields'] = stringify(ctrl_fields).replace(/"/g, "'");
        }

        

    }

    'iterate_sub_items'(cb_item, depth) {
        // this.inner.contents
        depth = depth || 0;
        var path;
        // 

        each(this.inner.content, (sub_item) => {


            cb_item(sub_item, depth);
            sub_item.iterate_sub_items(cb_item, depth + 1);
        });

        // But then recursively iterate those sub items too

    }

    'activate'() {
         if (!this.__active) {
            super.activate();

            //console.log('this._bound_events', this._bound_events);
            //console.log('this._bound_general_handler', this._bound_general_handler);

            // When the DOM element gets attached, as well as the item composed, need to attach the DOM events.
            //  Can try a clear and add again method for DOM events.

            // Items that get rendered to the DOM will need to have assigned events reattached when the get a DOM node.
            //  Could be a recursive reattachment that is needed.

            // recursive_reattach_dom_events





            


            // Get the references to the sub-item controls.
            //console.log('this.inner', this.inner);

            /*
            each(this.inner.content, (sub_item) => {
                //console.log('1) sub_item', sub_item);
                sub_item.on('click', (e_click) => {
                    // 
                });
            });
            */

            var ui_open = () => {
                this.inner.show();
            }
            var ui_close = () => {
                this.inner.hide();
            }

            // Listen for state change
            this.state.on('change', (e_change) => {
                //console.log('item state e_change ', e_change);

                var val = e_change.value;
                if (val === 'open') {
                    ui_open();
                }
                if (val === 'closed') {
                    ui_close();
                }
            });

            // Iterate through the inner menu items, setting up listeners for each of them.

            this.iterate_sub_items((sub_item, depth) => {
                //console.log('sub_item', sub_item);
            })




            // Listen for changes in inner items?
            //  Probably not by default.


         }
    }

    'open'() {
        this.state.set('open');
    }
    'close'() {
        this.state.set('closed');
    }
}
    //return Item;
module.exports = Item;