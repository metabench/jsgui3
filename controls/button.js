var jsgui = require('../html-core/html-core');
var Control = jsgui.Control;

class Button extends Control {
    'constructor'(spec, add, make) {
        // Wont fields have been set?
        super(spec);
        var that = this;
        this.__type_name = 'button';
        //this.add_class('button');
        this.add_class('button');
        // Want to have a system of accessing icons.
        //  Will be possible to do using a Postgres website db resource
        //   First want it working from disk though.
        
        // A way not to add the text like this to start with?
        //  Or just don't inherit from a button in some cases when we don't want this?


        

        if (spec.text) {
            this.text = spec.text;
        }
        if (!spec.no_compose) {
            if (!this._abstract && !spec.el) {
                if (spec.text) {
                    this.add(spec.text);
                }
            }
        }
        


    }
    'activate'() {
        super.activate();
    }
}
module.exports = Button;