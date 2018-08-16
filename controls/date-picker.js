/**
 * Created by james on 17/12/2016.
 */

// Could have an option to use the native date picker.
// The jsgui type of datepicker should look nicer though.

const jsgui = require('../html-core/html-core');
const stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
const Control = jsgui.Control;
//var Calendar = require('./calendar');
const Left_Right_Arrows_Selector = require('../controls/left-right-arrows-selector');
const Month_View = require('../controls/month-view');

/*
Being able to select dates (including times) in a nice user-friendly way is going to be worthwhile functionality for a variety of things.

*/

/*
    Micro Controls

    // Simple, encapsulated, extensible.

    Year Picker

    Month Picker

    Then we use Month View too
*/

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const years = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022];

class Year_Picker extends Left_Right_Arrows_Selector {
    constructor(spec) {
        Object.assign(spec, {
            'items': years,
            'item_index': 4,
            'loop': false
        });
        super(spec);
        this.add_class('year-picker');
    }
}

class Month_Picker extends Left_Right_Arrows_Selector {
    constructor(spec) {
        Object.assign(spec, {
            'items': months,
            'item_index': 7,
            'loop': true
        });
        super(spec);
        this.add_class('month-picker');
    }
}

class Date_Picker extends Control {
    constructor(spec) {
        spec.__type_name = spec.__type_name || 'date_picker';
        super(spec);
        this.add_class('date-picker');

        // Could start with a current date

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

        if (!spec.el) {
            this.compose_date_picker();
        }
    }
    compose_date_picker() {
        // Not sure this is best.
        //  Maybe just assign these when on the server. Just don't need them client-side once they have been loaded.

        this._ctrl_fields = this._ctrl_fields || {};
        Object.assign(this._ctrl_fields, {
            year_picker: this.year_picker = new Year_Picker({
                context: this.context
            }),
            month_picker: this.month_picker = new Month_Picker({
                context: this.context
            }),
            month_view: this.month_view = new Month_View({
                context: this.context
            })
        })
        this.add(this.year_picker);
        this.add(this.month_picker);
        this.add(this.month_view);
    }
    activate() {
        if (!this._active) {
            super.activate();

            // Should keep track of year etc properties.
            //  Maybe handle silent updates too.



            //let is_first_year = false;
            //let is_first_month = false;


            let is_first_month, is_first_year, is_last_month, is_last_year;


            let disable_enable_month_arrows = () => {
                if (is_first_year && is_first_month) {
                    this.month_picker.left_arrow.disabled = true;
                } else {
                    this.month_picker.left_arrow.disabled = false;
                }
                if (is_last_year && is_last_month) {
                    this.month_picker.right_arrow.disabled = true;
                } else {
                    this.month_picker.right_arrow.disabled = false;
                }
            }

            this.year_picker.on('change', e_year_change => {
                //console.log('e_year_change', e_year_change);
                if (e_year_change.size === -1) {
                    this.month_view.previous_year();
                }
                if (e_year_change.size === 1) {
                    this.month_view.next_year();
                }
                is_first_year = !!e_year_change.first;
                is_last_year = !!e_year_change.last;

                disable_enable_month_arrows();

                



                // Need to disable move right / next if at last month



                //is_first_year = !! e_year_change.first;
                

            })
            this.month_picker.on('change', e_month_change => {
                //console.log('e_month_change', e_month_change);

                if (e_month_change.size === -1) {
                    this.month_view.previous_month();
                }
                if (e_month_change.size === 1) {
                    this.month_view.next_month();
                }
                // Need to do this silently.
                if (e_month_change.loop === -1) {
                    this.year_picker.previous(false);
                }
                if (e_month_change.loop === 1) {
                    this.year_picker.next(false);
                }

                is_first_month = !!e_month_change.first;
                is_last_month = !!e_month_change.last;

                disable_enable_month_arrows();
                // old value too..
                // old index?

                //this.month_view.
            })
        }
    }
}


module.exports = Date_Picker;