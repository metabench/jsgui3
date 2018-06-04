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
    }
}
