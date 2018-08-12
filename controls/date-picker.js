/**
 * Created by james on 17/12/2016.
 */

// Could have an option to use the native date picker.
// The jsgui type of datepicker should look nicer though.

var jsgui = require('../html-core/html-core');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;
var Calendar = require('./calendar');

class Date_Picker extends Calendar {
    constructor(spec) {
        super();

        // Maybe this renders a calendar?
        //  mini calendar?


        // will have month view
        //  that's the main view

        // Display all of the days of the month in a grid.
        //  Could use a grid control and render the days into them.


        // a month_view component

        // month_view could be used in calendars too.

        // year: left right arrows selector
        // month: left right arrows selector
        // day: month view

        // Join them all up together
        //  Raise external events when the date changes.


        

        

    }
}
