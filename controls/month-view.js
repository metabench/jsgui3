/*
    Used to display the contents of a month
    A component of other controls, such as Calendar, Date_Picker

    Could inherit from Grid.
    Just shows the month's days inside.
*/


var jsgui = require('../html-core/html-core-enh');

// A general purpose grid...
//  Have something with a similar API to Vectorious?
//var Data_Grid = jsgui.Data_Grid;

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof, is_defined = jsgui.is_defined;
var Control = jsgui.Control;

const Grid = require('./grid');



class Month_View extends Grid {
    constructor(spec) {
        spec.grid_size = [7, 5];
        spec.__type_name = 'month_view';
        super(spec);

        // months are 0 indexed (for consistency with other things.)

        this.month = spec.month;
        this.year = spec.year;

        // 7 * 5 grid

        // problem is compose will override the previous compose 
        //  giving them more specific names.

        if (!spec.el) {
            this.compose_month_view();
        }

    }
    compose_month_view() {
        
    }

}


module.exports = Month_View;
