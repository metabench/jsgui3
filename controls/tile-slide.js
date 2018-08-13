// This is a Control Transformer
//  A function

var jsgui = require('../html-core/html-core');
var stringify = jsgui.stringify,
    each = jsgui.each,
    tof = jsgui.tof;
var Control = jsgui.Control;

class Tile_Slider extends Control {
    constructor(spec) {
        spec = spec || {};
        spec.__type_name = 'tile_slider';
        super(spec);

        // Could use a larger grid9 control, but with its central piece positioned in view.

        // Only concerned with central (normally full in view), left, above, right, below.

        // Has 5 controls.
        //  


        if (!spec.el) {
            this.compose_tile_slider();
        }



    }
    compose_tile_slider() {

        // May need to know / measure the size of the central div.
        //  Nice if we already have the info


        // And the sizes of these containers.


        const context = this.context;
        let above = new Control({
            'contect': context
        });
        above.add_class('above');
        this.add(above);
        let left = new Control({
            'contect': context
        });
        left.add_class('left');
        this.add(left);

        let right = new Control({
            'contect': context
        });
        right.add_class('right');
        this.add(right);
        let below = new Control({
            'contect': context
        });
        below.add_class('below');
        this.add(below);


        let central = new Control({
            'contect': context
        });
        central.add_class('central');
        this.add(central);
        // Central last, other are positioned absolutely (from beginning).


        this.above = above;
        this.left = left;
        this.central = central;
        this.right = right;
        this.below = below;

        this._ctrl_fields = {
            'above': above,
            'left': left,
            'central': central,
            'right': right,
            'below': below
        }

        this._fields = {
            'size': this.size
        }
    }

    slide_to_left() {
        // This exposes the element to the right.
        console.log('slide_to_left');
        console.log('this.size', this.size);

        console.log('this.central.dom.attributes', this.central.dom.attributes);

        this.central.dom.attributes.style.transition = 'transform 0.33s';
        this.central.dom.attributes.style.transform = 'translate(' + -1 * this.size[0] + 'px, 0px)';

        this.right.dom.attributes.style.transition = 'transform 0.33s';
        this.right.dom.attributes.style.transform = 'translate(' + -1 * this.size[0] + 'px, 0px)';

        // do it on the el?

    }
    slide_to_right() {
        // This exposes the element to the right.
        //console.log('slide_to_left');
        //console.log('this.size', this.size);

        //console.log('this.central.dom.attributes', this.central.dom.attributes);

        this.central.dom.attributes.style.transition = 'transform 0.33s';
        this.central.dom.attributes.style.transform = 'translate(' + this.size[0] + 'px, 0px)';

        this.left.dom.attributes.style.transition = 'transform 0.33s';
        this.left.dom.attributes.style.transform = 'translate(' + this.size[0] + 'px, 0px)';

        // do it on the el?

    }

    activate() {
        if (!this._active) {
            super.activate();

            setTimeout(() => {
                this.slide_to_right();
            }, 2000);
        }
    }

}

const Tile_Slide = function (Ctrl, fn_prev_spec, fn_next_spec, adjacencies = {
    left: -1,
    right: 1
}) {

    // map of where the prev and next go.



    // Return a new control that extends Tile_Slider and contains necessary instances of the original control.
    // Create both normal instances of the control, and controls with different specs that represent a different position on a larger grid.

    // Tile slide is quite important to a smooth mobile user interface
    //  It also will look fairly good in a desktop browser.
    // Currently this will work in just 2 or 4 directions.
    //  2 would be easiest, fine for a month or day selector.


    class Tile_Sliding_Ctrl extends Tile_Slider {
        constructor(spec) {

            let slider_spec = {
                context: spec.context,
                size: spec.size
            }
            super(slider_spec);

            if (spec.size) {
                slider_spec.size = spec.size;
                this.size = spec.size;
                console.log('spec.size', spec.size);
            }

            /*
            if (spec.size) {
                this.central.size = spec.size;
                this.dom.attributes.style.overflow = 'hidden';
                this.dom.attributes.style.position = 'absolute';
                
            }
            */
            //if (spec.size) {
            //slider_spec.size = spec.size;
            //}


            //console.log('spec', spec);
            //console.log('spec.size', spec.size);
            //this.size = spec.size;
            // 

            this.spec = spec;



            //console.log('prev_spec', prev_spec);
            //console.log('spec', spec);


            if (!spec.el) {
                this.compose_tile_sliding_ctrl();
            }










            if (spec.size) {
                //this.central.size = spec.size;


            }



            // then make versions with modified specs and put them adjacent.

            // Moving to the right will mean swiping to the left.




        }
        compose_tile_sliding_ctrl() {
            let prev_spec = fn_prev_spec(this.spec);
            let next_spec = fn_next_spec(this.spec);

            console.log('this.spec.size', this.spec.size);

            if (this.spec.size) {
                this.central.size = this.spec.size;
                this.dom.attributes.style.overflow = 'hidden';
                this.dom.attributes.style.position = 'relative';

                this.left.dom.attributes.style.position = 'absolute';
                this.left.dom.attributes.style.left = -1 * this.spec.size[0] + 'px';
                this.right.dom.attributes.style.position = 'absolute';
                this.right.dom.attributes.style.left = this.spec.size[0] + 'px';

                this.left.size = this.spec.size;
                this.right.size = this.spec.size;
            }

            if (adjacencies.left === -1) {
                // make a previous version to put left of it.
                //let left_ctrl_prev_spec = fn_prev_spec()
                let left_ctrl_prev = new Ctrl(prev_spec);
                this.left.add(left_ctrl_prev);
                //if (prev_spec.size) {

                //}
            }

            let ctrl = new Ctrl(this.spec);
            this.central.add(ctrl);

            if (adjacencies.right === 1) {
                // make a previous version to put left of it.
                //let left_ctrl_prev_spec = fn_prev_spec()

                let left_ctrl_prev = new Ctrl(next_spec);
                this.right.add(left_ctrl_prev);
                if (next_spec.size) {

                }
            }


        }

    }


    return Tile_Sliding_Ctrl;




}

//Tile_Slider

Tile_Slider.wrap = Tile_Slide;

module.exports = Tile_Slider;