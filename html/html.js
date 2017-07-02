/**
 * Created by James on 16/09/2016.
 */
//"use strict";
var jsgui = require('../html-core/html-core');
var str_arr_mapify = jsgui.str_arr_mapify;
var get_a_sig = jsgui.get_a_sig;
var each = jsgui.each;
var Control = jsgui.Control;

var map_Controls = jsgui.map_Controls = {};

// And load in all or a bunch of the controls.

// Can we require all of the controls at once, and then merge them?

var Controls = require('../controls/controls');

Object.assign(jsgui, Controls);



//jsgui.Toggle_Button =




module.exports = jsgui;