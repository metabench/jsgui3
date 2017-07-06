
var jsgui = require('../html-core/html-core');
//var Horizontal_Menu = require('./horizontal-menu');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;

var Button = require('./button');
var Item = require('./item');
var Collection = jsgui.Collection;
var Data_Value = jsgui.Data_Value;

// Titled_Panel would be useful.
//  Would extend the panel, and also show it's name or title.

// Want to keep panel simple. Could have Titled_Panel, maybe Resizable_Panel.
//  If we want a panel with a lot of functionality, it would be the Flexi_Panel.

class Popup_Menu_Button extends Button {
    // panel name?

    // could have a title field.
    //'fields': {
    //    'name': String
    //}
    // maybe add before make would be better. add will probably be used more.
    'constructor'(spec, add, make) {
        spec.no_compose = true;
        super(spec);

        this.__type_name = 'popup_menu_button';
        //this.add_class('panel');
        this.add_class('popup-menu-button');
        var context = this.context;
        var that = this;
        // With name as a field, that field should get sent to the client...

        // Then will have the hidden menu that appears when the popup menu button is clicked.

        // Has a list/collection of items.

        // Use Stateful mixin?

        // Mixins may be a bit tricky in terms of adding both composition and activation stages.
        //  Mixins would need to be loaded in order, and applied with care.
        //  ._mixin_compose
        //  ._mixin_activate
        //  ._arr_mixin_names

        //  These two would also need to be made as properties of the Control, so that they can be added to by the mixins.
        //  ._active_fields
        //  ._ctrl_fields




        var setup_mixins = function () {
            this.mixin(
                ['open_closed', 'closed'],
                ['item_container']
            )
        }

        this.states = ['closed', 'open'];
        this.state = new Data_Value('closed');
        this.i_state = 0;

        var active_fields = this.active_fields = {};
        active_fields.states = this.states;
        active_fields.state = this.state;
        active_fields.i_state = this.i_state;

        var compose = () => {
            this.text = spec.text || spec.label || '';
            var root_menu_item = new Item({
                'context': context,
                'item': this.text
            });

            that.add(root_menu_item);
            that.root_menu_item = root_menu_item;

            // Then the inner part / the part that is hidden within the root node.
            // Show / hide the hidden area based on click or hover.

            if (spec.items) {
                //console.log('spec.items', spec.items);
                this.items = new Collection(spec.items);
                //console.log('this.items', this.items);
                each(this.items, (item) => {
                    //console.log('item', item);

                    var menu_item = new Item({
                        'context': context,
                        'item': item
                    });

                    root_menu_item.inner.add(menu_item);

                    // Then add a callback event, if we have that.
                    //  Post-activation I suppose.


                });
            };

            var ctrl_fields = {
                'root_menu_item': root_menu_item._id()
            }

            //this.set('dom.attributes.data-jsgui-ctrl-fields', stringify(ctrl_fields).replace(/"/g, "'"));
            this.dom.attrs['data-jsgui-fields'] = stringify(active_fields).replace(/"/g, "'");
            this.dom.attrs['data-jsgui-ctrl-fields'] = stringify(ctrl_fields).replace(/"/g, "'");
        }




        if (!spec.abstract && !spec.el) {
            // Render the menu itself as a bunch of items / an item tree.

            // Create the top level menu item.
            compose();

            

            

        }

        if (spec.el) {
            // A different type of constructor usage. Most likely client-side / within a web browser.

            // The element could be empty.
            //  If so, we need to carry out the compose stage.
            compose();

            // Needs to reflect changes within itself to the DOM.
            //  Possibly this is where react could come in.

            // It does not have a rendering phase at the moment when it's not being rendered on the server.
            //  Want small and to-the-point client-side rendering.


        }



    }
    //'resizable': function() {
    //},
    'activate'() {
        if (!this.__active) {
            super.activate();



            var root_menu_item = this.root_menu_item;
            console.log('Popup_Menu_Button activate');
            // Need references?
            var that = this;

            //console.log('this.root_menu_item', this.root_menu_item);

            // Respond to clicks / selects of the inner menu items.
            // All the descendent items need to have events.
            //  Want to have it so that the event handler can be called directly when that item is clicked.

            // Want to set up the onclicks in the construction / composition.



            //console.log('root_menu_item', root_menu_item);

            this.state.on('change', function(e_change) {
                //console.log('Popup_Menu_Button state change', e_change);

                // Change it in the UI at this point.
                var val = e_change.value;
                //console.log('val', val);

                //if (val == 'closed') {
                    //ui_close();
                //    root_menu_item.close();
                //}

                //if (val == 'open') {
                    //ui_open();
                //    root_menu_item.open();
                //}

                root_menu_item.state.set(val);
            });


            root_menu_item.on('click', function(e_click) {
                //console.log('root_menu_item clicked e_click', e_click);

                // have a control target?
                // Find out if that control is part of this control directly, not part of any other control?

                //if (e_click.target === root_menu_item.dom.el) {
                    //console.log('that.state', that.state);
                    //console.log('that.i_state', that.i_state);
                    //console.log('that.states', that.states);

                    //console.log('tof that.state', tof(that.state));

                    var new_i_state = that.i_state + 1;
                    if (new_i_state === that.states.length) {
                        new_i_state = 0;
                    }

                    that.i_state = new_i_state;
                    that.state.set(that.states[new_i_state]);
                //}

                

            });

            // Listen for the various changes on inner buttons.
            //  Want an easy way to iterate them.
            //console.log('pre iterate_sub_items');

            // Could attach the events earlier.
            //  Want to try that.

            /*

            root_menu_item.iterate_sub_items((item, str_path) => {
                //console.log('item', item);
                item.on('click', (e_click) => {

                    console.log('sub item click', e_click);
                    console.log('sub item: ', item);
                })
            });

            */


            

        }


    }
}
module.exports = Popup_Menu_Button;
