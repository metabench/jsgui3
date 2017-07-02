var jsgui = require('../html-core/html-core');
var Text_Input = require('./text-input');
var stringify = jsgui.stringify, each = jsgui.each, tof = jsgui.tof;
var Control = jsgui.Control;

var fields = [
	['text', String],
	['name', String],
	['value', String],
	['type', String]
];

class Text_Field extends Control {
	// fields... text, value, type?
	//  type could specify some kind of validation, or also 'password'.

	//  and can have other fields possibly.
	'constructor'(spec) {
		super(spec);
		this.add_class('field');

		var left = new jsgui.div({
			'context': this.context
		});
		left.add_class('left');

		var right = new jsgui.div({
			'context': this.context
		});
		right.add_class('right');
		// adding should set the context properly.

		this.add(left);
		this.add(right);

		var clearall = new jsgui.div({
			'context': this.context
		});
		clearall.add_class('clearall');
		this.add(clearall);

		var label = new jsgui.label({
			'context': this.context

		});
		var text = this.get('text');
		//console.log('text ' + text);
		//console.log('tof text ' + tof(text));
		label.add(text.value());

		var textInput = new Text_Input({
			'context': this.context
		});
		var tiid = textInput._id();
		textInput.dom.attributes.id = tiid;
		textInput.dom.attributes.name = this.name;

		label.dom.attributes.for = tiid;

		// and the type... it could be a password.
		//  that's a DOM attribute.
		textInput.dom.attributes.type = spec.type;
		left.add(label);
		right.add(textInput);
		//this.add_event_listener('change', function(e) {
			//console.log('Text_Field change event e ' + stringify(e));
		//});
	}
}
module.exports = Text_Field;