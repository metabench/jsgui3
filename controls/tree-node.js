var jsgui = require('../html-core/html-core');
var Plus_Minus_Toggle_Button = require('./plus-minus-toggle-button');
var Vertical_Expander = require('./vertical-expander');

var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;

var fields = [
	//['text', String]
	['toggle_button', Control],
	['inner_control', Control],
	['expander', Control]
];

class Tree_Node extends Control {

	'constructor'(spec, add, make) {
		// Wont fields have been set?
		super(spec);
		// Can take an image
		// Can take some text.
		//  That's all I'll have in the tree node for now.
		this.__type_name = 'tree_node';

		if (!this._abstract) {

			if (typeof document == 'undefined') {
				this.add_class('tree-node');


				var spec_state = spec.state, state;
				//console.log('**** spec.img_src', spec.img_src);
				if (spec.img_src) {
					//this.set('img_src', spec.img_src);
					var img_src = this.img_src;
					//console.log('img_src', img_src);
					//console.log('this._', this._);
					//throw '1) stop;'
				}
				if (spec.text) {
					this.set('text', spec.text);
				}

				if (spec_state) {
					if (spec_state == 'expanded' || spec_state == 'contracted') {
						this.state = spec_state;
					} else {
						throw 'spec.state expects "expanded" or "contracted".';
					}
				} else {
					//state = this.set('state', 'expanded');
					this.state = 'expanded';
				}

				var top_line = add(Control({ 'class': 'top-line' }));
				var plus_minus = make(Plus_Minus_Toggle_Button({}));
				top_line.add(plus_minus);

				plus_minus.hide();

				var img_src = this.img_src;


				var img = make(jsgui.img({}));
				img.dom.attributes.src = img_src;
				top_line.add(img);

				// Also add the text to the top line.

				var span = make(jsgui.span({}));

				var text = this.text;

				span.add(text);
				top_line.add(span);

				var clearall = add(Control({'class': 'clearall'}));

				var expander = add(Vertical_Expander({}));
				var inner_control = make(Control({ 'class': 'inner' }));
				expander.add(inner_control);
				var inner_control_content = inner_control.content;
				inner_control_content.on('change', function(e_change) {
					//console.log('Tree_Node inner_control_content change', e_change);
					//throw 'stop';

					var l = inner_control_content.length();
					//console.log('l', l);

					if (l > 0) {
						plus_minus.show();
					}

					//throw 'stop';
				});
				this.toggle_button = plus_minus;
				//console.log('pre set inner_control');
				this.inner_control = inner_control;
				//console.log('post set inner_control');
				this.expander = expander;

				var ctrl_fields = {
					'toggle_button': plus_minus._id(),
					'inner_control': inner_control._id(),
					'expander': expander._id()
				};

				this.set('dom.attributes.data-jsgui-ctrl-fields', stringify(ctrl_fields).replace(/"/g, "'"));
				this.active();
			}
		}
	}
	// I think a pre-render function would be useful.
	//  Something that sets data-jsgui DOM attributes.

	'activate'() {
        super.activate();
		// ctrl-fields not working?
		// Need to listen to the toggle event of the plus minus toggle button

		// This will be done through the ctrl~_fields system.
		//  Would like an easier way of setting that up.
		var toggle_button = this.toggle_button;
		//console.log('toggle_button', toggle_button);

		var inner_control = this.inner_control;
		var expander = this.expander;
		//console.log('inner_control', inner_control);

		toggle_button.on('toggle', function(e_toggle) {
			console.log('tree-node toggle', e_toggle);
			// need to expand or contract the
			// need to expand or contract the inner control.
			//  Mixins could be good for this type of functionality.
			//  Something that enhances a Control without making a new Class.
			expander.toggle();
		})
	}
}
module.exports = Tree_Node;