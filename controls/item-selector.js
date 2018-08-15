/*
    May wind up as superclass of Combo_Box
    Maybe will have a massive amount of options and modes.

    For the moment, want this to handle a relatively small array of items.

    

*/

var jsgui = require('../html-core/html-core');

//function(jsgui, Plus_Minus_Toggle_Button, Vertical_Expander) {

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;

const Item_View = require('./item-view');
const List = require('./list');

class Item_Selector extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'item_selector';
        super(spec);
        // selected_index
        // Could have Object assignproperies done here
        //  use local variables as true private variables.

        this.items = spec.items;

        if (!spec.el) {
            this.compose_item_selector();
        }
    }
    compose_item_selector() {
        // In combo mode normally.
        // current_item
        // item_list

        let current_item_view = this.current_item_view = new Item_View({
            context: this.context
        });
        this.add(current_item_view);

        console.log('compose_item_selector this.items', this.items);

        let item_list = this.item_list = new List({
            context: this.context,
            items: this.items
        });
        item_list.hide();
        this.add(item_list);

        // Render all of the items in a list.
        //  Grid of some kind depending on if horizontal or vertical
        //  

        // Items hidden in a list, the rest of the items in the list hidden?
        //  Specific copy of the item that gets shown, also be able to show item list.

        // Just show it in a list anyway.

        // Go for both single item with neighbours on tiles.
        //  Also all items rendered in a list / sequence.

        // Item_List with direction: horizontal would work well.

        // Item_View
        //  And Tile_Slide processed item view.

        // Want a very simple Item_View that renders the string item as a span, in an item view control marked with classes in the DOM.
        //  Want Item_View with no expand/contract.



        


    }
}

module.exports = Item_Selector;