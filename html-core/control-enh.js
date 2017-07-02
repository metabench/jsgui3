/**
 * Created by James on 16/09/2016.
 */
var jsgui = require('../lang/lang');
var is_ctrl = jsgui.is_ctrl;
var get_a_sig = jsgui.get_a_sig, fp = jsgui.fp, each = jsgui.each;
var Control_Core = require('./control-core');
var tof = jsgui.tof;
// get_a_sig

var desc = function(ctrl, callback) {
	if (ctrl.get) {


		var content = ctrl.get('content');
		//console.log('content', content);
		var t_content = typeof content;
		//console.log('t_content', t_content);

		if (t_content === 'string' || t_content === 'number') {

		} else {
			// it's a Collection

			var arr = content._arr;
			var c, l = arr.length;

			//console.log('l', l);
			var item, t_item;

			for (c = 0; c < l; c++) {
				item = arr[c];
				t_item = typeof item;
				if (t_item === 'string' || t_item === 'numbers') {

				} else {
					callback(arr[c]);
					desc(arr[c], callback);
				}
			}
		}
	}
}

var dom_desc = function(el, callback) {
	// Possibly need to look at the element's node type.
	//
	callback(el);

	var cns = el.childNodes;

	var l = cns.length;

	for (var c = 0; c < l; c++) {
		dom_desc(cns[c], callback);
	}
}


var mapDomEventNames = {
    'change': true,

    'click': true,
    'mousedown': true,
    'mouseup': true,
    'mousemove': true,
    'mouseover': true,
    'mouseout': true,
    'blur': true,
    'focus': true,
    'keydown': true,
    'keyup': true,
    'keypress': true,
    'contextmenu': true,

    'touchstart': true,
    'touchmove': true,
    'touchend': true,

    'abort': true,
    'canplay': true,
    'canplaythrough': true,
    'durationchange': true,
    'emptied': true,
    'ended': true,
    'error': true,
    'loadeddata': true,
    'loadedmetadata': true,
    'loadstart': true,
    'pause': true,
    'play': true,
    'playing': true,
    'progress': true,
    'ratechange': true,
    'seeked': true,
    'seeking': true,
    'stalled': true,
    'suspend': true,
    'timeupdate': true,
    'volumechange': true,
    'waiting': true

};

class Control extends Control_Core {
	//'fields': {
	//	'selection_scope': Object,
	//	'is_selectable': Boolean,
	//	'scrollbars': String
	//},

	'constructor'(spec) {
		// The enhanced control can look at the element for data-jsgui-fields
		//  Those fields will be fed back into the initialization.

		if (spec.el) {
			var jgf = spec.el.getAttribute('data-jsgui-fields');

			if (jgf) {
				var s_pre_parse = jgf.replace(/\[DBL_QT\]/g, '"').replace(/\[SNG_QT\]/g, '\'');
				s_pre_parse = s_pre_parse.replace(/\'/g, '"');
				var props = JSON.parse(s_pre_parse);
				//extend(spec, props);
				Object.assign(spec, props);
			}
		}

		super(spec);;

		if (typeof spec.selection_scope !== 'undefined') {
			//console.log('spec.selection_scope', spec.selection_scope);
			//var selection_scope = this.context.get_selection_scope_by_id(spec.selection_scope);
			//  Do we need to set the control of the selection scope?

			//console.log('selection_scope', selection_scope);
			this.selection_scope = selection_scope;
			// then if we have the selection scope, we should set it up for the control.
			var scrollbars = this.scrollbars;
			console.log('scrollbars', scrollbars);


			var active_scroll = false;

			if (scrollbars === 'both' || scrollbars === 'horizontal' || scrollbars === 'vertical') {
				active_scroll = true;

				// Put a Scroll_View in place in this control.


				var scroll_view = new Scroll_View({
					'context': this.context
				})

				this.add(scroll_view);
			}

		}

		if (spec.is_selectable) {
			this.selectable();
		}


	}

	'bcr'() {
		//console.log('sig', sig);
		var a = arguments; a.l = arguments.length; var sig = get_a_sig(a, 1);
		if (sig == '[]') {
			var el = this.dom.el;
			var bcr = el.getBoundingClientRect();
			var res = [[bcr.left, bcr.top], [bcr.right, bcr.bottom], [bcr.width, bcr.height]];
			return res;
		}
		if (sig == '[a]') {
			console.log('bcr sig arr');
			var bcr_def = a[0];
			var pos = bcr_def[0];
			var br_pos = bcr_def[1];
			var size = bcr_def[2];
			// then we actually want to set the css.
			this.style({
				'position': 'absolute',
				'left': pos[0] + 'px',
				'top': pos[1] + 'px',
				'width': size[0] + 'px',
				'height': size[1] + 'px'
			});
		}
	}
	'add_text'(value) {
		var tn = new Text_Node({
			'context': this.context,
			'text': value + ''
		})
		this.add(tn);
		return tn;
	}
	'computed_style'() {
		var a = arguments; a.l = arguments.length; var sig = get_a_sig(a, 1);
		var y;
		if (sig == '[s]') {
			// Should only work on the client.
			var property_name = a[0];
			var el = this.dom.el;
			if (el.currentStyle)
				y = el.currentStyle[styleProp];
			else if (window.getComputedStyle)
				y = document.defaultView.getComputedStyle(el, null).getPropertyValue(property_name);
			return y;
		}
	}
	// Likely to be within the core.
	//  Meaning it's not done with progressive enhancement.
	'padding'() {
		var a = arguments; a.l = arguments.length; var sig = get_a_sig(a, 1);
		if (sig == '[]') {
			
			var left, top, right, bottom;

			var c_padding = this.computed_style('padding');
			//console.log('c_padding', c_padding);

			var s_c_padding = c_padding.split(' ');
			//console.log('s_c_padding.length', s_c_padding.length);

			if (s_c_padding.length == 3) {
				// top, right, bottom
				top = parseInt(s_c_padding[0], 10);
				right = parseInt(s_c_padding[1], 10);
				bottom = parseInt(s_c_padding[2], 10);
				return [0, top, right, bottom];
			}
		}
	}
	'border'() {
		var a = arguments; a.l = arguments.length; var sig = get_a_sig(a, 1);
		if (sig == '[]') {

			var left, top, right, bottom;

			var c_border = this.computed_style('border');
			console.log('c_border', c_border);

			throw 'stop';
		}
	}
	'border_thickness'() {
		var a = arguments; a.l = arguments.length; var sig = get_a_sig(a, 1);
		if (sig == '[]') {
			var left, top, right, bottom;

			var c_border = this.computed_style('border');
			console.log('c_border', c_border);

			//var s_c_border = c_border.split(' ');
			//console.log('s_c_border', s_c_border);

			// Can't really split it by space.
			//  some of the terms in the bracket include a space.
			//  could first do a regex to change ', ' to ','

			var b2 = c_border.split(', ').join('');
			var s_c_border = b2.split(' ');
			console.log('s_c_border', s_c_border);
			// then can get the thickness from the first one.
			var thickness = parseInt(s_c_border[0], 10);
			// the 4 different thicknesses?
			return thickness;
		}
	}

	'cover'() {
		// Makes a cover to this control.
		//  Relatively positioned div as first child (if it is not there already)
		//  Absolutely positioned within that relative div.

		// insert a new relative div?
		//  relative for layout?

	}

	'ghost'() {

	}

	// absolute_ghost_clone
	'absolute_ghost_clone'() {

		var type_name = this.__type_name;
		var id = this._id();
		var context = this.context;

		// spin up a new control, using they type of controls.

		console.log('context', context);

		var ctrl_document = context.ctrl_document;

		console.log('ctrl_document', ctrl_document);
		console.log('type_name', type_name);

		var Cstr = context.map_Controls[type_name];
		console.log('Cstr', Cstr);

		// We can create a new one, with a new ID.

		var new_id = id + '_clone';
		var map_controls = context.map_controls;

		// Want the body control as well.



		if (!map_controls[new_id]) {
			// create it.

			var new_ctrl = new Cstr({
				'context': context,
				'id': new_id
			})

			console.log('new_ctrl', new_ctrl);

			//var body = ctrl_document.body();

			var body = ctrl_document.content().get(1);

			var css_class = this.get('dom.attributes.class');
			new_ctrl.set('dom.attributes.class', css_class);

			// Should copy the controls inside the one being cloned.
			var my_contents = this.content;

			// should be able to clone a Data_Value too.



			each(my_contents, function(v, i) {
				console.log('i', i);
				console.log('v', v);

				// Adding a Data_Value not working?

				var v_clone = v.clone();
				console.log('v_clone', v_clone);

				// could get the value if it's a Data_Value for the moment...
				//  Adding a Data_Value to a

				//if (v_clone.value) {
				if (v_clone instanceof jsgui.Data_Value) {
					new_ctrl.add(v_clone.value());
				} else {
					new_ctrl.add(v_clone);
				}



			})

			console.log('this', this);
			// could get the computed width?

			// computed padding too?

			var my_bcr = this.bcr();

			console.log('my_bcr', my_bcr);

			var my_padding = this.padding();
			console.log('my_padding', my_padding);

			my_bcr[2][0] = my_bcr[2][0] - my_padding[0];
			my_bcr[2][1] = my_bcr[2][1] - my_padding[1];
			my_bcr[2][0] = my_bcr[2][0] - my_padding[2];
			my_bcr[2][1] = my_bcr[2][1] - my_padding[3];

			var my_border_thickness = this.border_thickness();

			console.log('my_border_thickness', my_border_thickness);

			var t_my_border_thickness = tof(my_border_thickness);

			if (t_my_border_thickness == 'number') {
				my_bcr[2][0] = my_bcr[2][0] - 2 * my_border_thickness;
				my_bcr[2][1] = my_bcr[2][1] - 2 * my_border_thickness;
			}
			new_ctrl.bcr(my_bcr);

			console.log('new_ctrl', new_ctrl);
			body.add(new_ctrl);

			var new_el = new_ctrl.dom.el;
			console.log('new_el', new_el);

		}

	}

	// can have different monomorphic versions.

	'set'(name, value) {
		// Used for setting controls, on the server, that get persisted to the client.

		// when the value is a control, we also want to set the ._jsgui_ctrl_fields



		if (typeof value !== 'undefined') {
			//var t_val = tof(value);
			//console.log('t_val', t_val);

			if (is_ctrl(value)) {
				var cf = this._ctrl_fields = this._ctrl_fields || {};

				cf[name] = value;
			}

			Control_Core.prototype.set.call(this, name, value);

			//super(name, value);

			//return this._super(name, value);
		} else {
			//return this._super(name);
			Control_Core.prototype.set.call(this, name);
			//super(name);
		}
	}

	'one_mousedown_anywhere'(callback) {
		//var ctrl_html_root = this.context.ctrl_document;
		//console.log('this.context', this.context);
		var body = this.context.body();

		var that = this;

		body.one('mousedown', function(e_mousedown) {
			// Maybe see if it's internal or external to the control

			// Would be good to have that in the event.

			var el = that.dom.el;

			var e_el = e_mousedown.srcElement || e_mousedown.target;





			//console.log('one mousedown', e_mousedown);
			//console.log('e_el', e_el);

			// Want to see if the element clicked on is a descendant of this's el.
			var iao = that.is_ancestor_of(e_el);
			//console.log('iao', iao);

			e_mousedown.within_this = iao;

			callback(e_mousedown);

		});
	}


	// This may need to search inside for controls to be activated.
	//  Need to get this to work with client-rendered content.


	'activate_recursive'() {
		//console.log('activate_recursive');
		var el = this.dom.el;

		var context = this.context;
		var map_controls = context.map_controls;

		var parent_control;

		// does the control have a DOM node?


		recursive_dom_iterate_depth(el, function(el2) {
			//console.log('el ' + el);
			var nt = el2.nodeType;
			//console.log('nt ' + nt);
			if (nt == 1) {
				var jsgui_id = el2.getAttribute('data-jsgui-id');

				console.log('jsgui_id ' + jsgui_id);
				if (jsgui_id) {
					// Not so sure the control will exist within a map of controls.
					//  If we have activated the whole page, then they will exist.
					//  However, we may just want to do activate on some controls.
					//throw 'stop';

					var ctrl = map_controls[jsgui_id];

					console.log('jsgui_id', jsgui_id);
					console.log('!!ctrl', !!ctrl);

					if (!ctrl.__active) ctrl.activate(el2);
					//parent_control = ctrl;




					//console.log('jsgui_type ' + jsgui_type);
				}
			}
		})
    }

    'add_dom_event_listener'(event_name, fn_handler) {
        console.log('add_dom_event_listener', event_name, this.__id);
        var listener = this._bound_events[event_name];
        var that = this;

        var el = this.dom.el;

        console.log('el', el);
        console.trace();

        if (el) {
            console.log('listener', listener);

            // The listener has been set up already.
            //  It looks like its an array.
            //  Event has been added twice for some reason.



            

            /*
            if (!listener) {
                // a single listener called when a bound dom event fires.
                //  this will then split up the event calls to everything that is listening to this.
                // for the DOM event on the object, we raise the event on the control.

                listener = this.mapListeners[event_name] = function (e) {
                    //console.log('event_name heard ' + event_name);

                    // Raising an event, there could be multiple listeners.
                    //  would be good to get an array of what the listeners returned.
                    //  Return false here if any of them return false?


                    var res_raise = that.raise(event_name, e);
                    //console.log('res_raise', res_raise);

                    // then if any results are false, we return false.

                    var any_are_false = false;
                    var c = 0, l = res_raise.length;

                    while (!any_are_false && c < l) {
                        if (res_raise[c] === false) {
                            any_are_false = true;
                        }

                        c++;
                    }

                    //console.log('any_are_false', any_are_false);

                    if (any_are_false) {
                        e.preventDefault();
                        return false;
                    }
                    // Would like to respond to the event.
                    //  Eg if the dom event handler returns false, it would be good to return false in the listener.



                };
            }

                */
            var t_listener = tof(listener);
            console.log('t_listener', t_listener);
            console.log('pre el addEventListener');

            if (t_listener === 'array') {
                console.log('listener.length', listener.length);
                each(listener, (listener) => {
                    el.addEventListener(event_name, listener, false);
                });
            } else {
                el.addEventListener(event_name, listener, false);
            }
        }
    }

	// fp removal candidate

	'add_event_listener'() {

		var a = arguments; a.l = arguments.length; var sig = get_a_sig(a, 1);
        
		console.log('control-enh add_event_listener sig', sig);

		/*
		 var el = this.dom.el;
		 if (el) {

		 // Check if the element has that event listener...
		 //  Maybe maintain a map within the control of which DOM functions have been bound to the element.



		 el.addEventListener(event_name, handler, false);
		 }
		 */

		// In enh - with this only working post-activation?

		// see http://www.w3schools.com/tags/ref_av_dom.asp
		/*
		 abort	Fires when the loading of an audio/video is aborted
		 canplay	Fires when the browser can start playing the audio/video
		 canplaythrough	Fires when the browser can play through the audio/video without stopping for buffering
		 durationchange	Fires when the duration of the audio/video is changed
		 emptied	Fires when the current playlist is empty
		 ended	Fires when the current playlist is ended
		 error	Fires when an error occurred during the loading of an audio/video
		 loadeddata	Fires when the browser has loaded the current frame of the audio/video
		 loadedmetadata	Fires when the browser has loaded meta data for the audio/video
		 loadstart	Fires when the browser starts looking for the audio/video
		 pause	Fires when the audio/video has been paused
		 play	Fires when the audio/video has been started or is no longer paused
		 playing	Fires when the audio/video is ready to play after having been paused or stopped for buffering
		 progress	Fires when the browser is downloading the audio/video
		 ratechange	Fires when the playing speed of the audio/video is changed
		 seeked	Fires when the user is finished moving/skipping to a new position in the audio/video
		 seeking	Fires when the user starts moving/skipping to a new position in the audio/video
		 stalled	Fires when the browser is trying to get media data, but data is not available
		 suspend	Fires when the browser is intentionally not getting media data
		 timeupdate	Fires when the current playback position has changed
		 volumechange	Fires when the volume has been changed
		 waiting	Fires when the video stops because it needs to buffer the next frame

		 abort
		 canplay
		 canplaythrough
		 durationchange
		 emptied
		 ended
		 error
		 loadeddata
		 loadedmetadata
		 loadstart
		 pause
		 play
		 playing
		 progress
		 ratechange
		 seeked
		 seeking
		 stalled
		 suspend
		 timeupdate
		 volumechange
		 waiting
		 */

		// So, it should also bind the event to the control, so a listener will hear that.
		// But does this apply itself???
		if (a.l === 2) {
			//this._super.apply(this, a);
			super.add_event_listener(a[0], a[1]);
		}
		if (a.l === 3) {
			//this._super.apply(this, [a[0], a[2]]);
            super.add_event_listener(a[0], a[2]);
		}
		// then if it appears in the dom events, attach it.

		if (sig === '[s,f]' || sig === '[s,b,f]') {
			var event_name = a[0];
			var using_dom = true;
			if (a.l === 3 && a[1] === false) using_dom = false;
			//console.log('using_dom', using_dom);
            var fn_handler;
            if (a.l === 2) fn_handler = a[1];
            if (a.l === 3) fn_handler = a[2];

			// change is also a DOM event
			//  that's a tricky one.
			//  should make it easy to listen out for DOM changes.
			// let's include it for the moment.
			//console.log('a[0]', a[0]);

			//console.log('mapDomEventNames[a[0]]', mapDomEventNames[a[0]]);


			if (mapDomEventNames[a[0]] && using_dom) {
				//console.log('we have a DOM event: ' + event_name);
                console.log('pre call add_dom_event_listener from add_event_listener');
                console.log('this.dom.el', !!this.dom.el);

                // Want a way of recording that the event has been added to the DOM?



                this.add_dom_event_listener(event_name, fn_handler);

				
			}
		}
	}

	// not recursive
	//  maybe call activate_individual?

	//

	'activate'(el) {
		if (!this.__active) {
			this.__active = true;
			//console.log('el', el);
			if (el) {
				//this.set('dom.el', el);
				this.dom.el = el;
			}

			//

			// Could ensure all element references to start with.
			//


			this.activate_dom_attributes();
			this.activate_content_controls();
			this.activate_content_listen();
			this.activate_other_changes_listen();


			// No point doing this any longer. These references are OK.
			//this.rec_desc_ensure_ctrl_el_refs();

			// Attach DOM event listeners
			//  Attach the unattached ones.
			//  Go through the events for the control, and see which of them are to be attached to the DOM, but have not been attached already.
			//   This needs to be used when the content is created client-side, and put into the DOM.

			// Check to see that we are attaching unattached event listeners?



			//console.log('5) ' + this._.content._arr.length);
		}
	}

	//'attach_unattached_dom_event_listeners'() {

	//}

	'activate_other_changes_listen'() {
		//var el;
		var dom_attributes = this.dom.attrs;
		//console.log('dom_attributes', dom_attributes);

		var el = this.dom.el;
		//if (dv_el) el = dv_el.value();

		dom_attributes.on('change', function(e_change) {
			var property_name = e_change.name || e_change.key, dval = e_change.value || e_change.new;
			var t_dval = tof(dval);

			if (t_dval == 'string' || t_dval == 'number') {
				//el.setAttribute('style', dval);
			} else {
				//el.setAttribute('style', dval.value());

				dval = dval.value();
			}

			if (el && el.nodeType === 1) {
				el.setAttribute(property_name, dval);
			}
		});
	}
	'activate_content_listen'() {
		//console.log('activate_content_listen');
		var content = this.content;
		//console.log('1) content.length()', content.length());
		var that = this;
		var context = this.context;
		var map_controls = context.map_controls;
		//console.log('map_controls', map_controls);

		content.on('change', function(e_change) {

			//console.log('content change', e_change);

			var itemDomEl;
			var el;
			var dv_el = that.dom.el;
			//console.log('that.__id', that.__id);
			if (dv_el) el = dv_el;
			var type = e_change.type;
			if (type === 'insert') {
				//console.log('e_change', e_change);
				var item = e_change.item;
				//console.log('item', item);
				var retrieved_item_dom_el = item.dom.el;
				var t_ret = tof(retrieved_item_dom_el);
				//console.log('t_ret', t_ret);
				//throw 'stop';
				if (t_ret === 'string') {
					itemDomEl = retrieved_item_dom_el;
				} else {
					//console.log('item', item);
					// Not so sure it's a Data_Value here.
					//  It generally should be, but it may not always be.
					//console.log('dv_item_dom_el', retrieved_item_dom_el);

					//console.log('retrieved_item_dom_el', retrieved_item_dom_el);
					if (retrieved_item_dom_el) console.log('keys dv_item_dom_el', Object.keys(retrieved_item_dom_el));
					//console.log('tof retrieved_item_dom_el', tof(retrieved_item_dom_el));
					//throw 'stop';
					if (retrieved_item_dom_el) {
						itemDomEl = dv_item_dom_el.value();
					}
					//if (itemDomEl) console.log('1) itemDomEl', itemDomEl);

					// need to render the item ID in there too.
					//var id = item._id();

					if (!itemDomEl) {
						//console.log('item._id()', item._id());
						if (context.map_els[item._id()]) {
							itemDomEl = context.map_els[item._id()];
						}

					}
					//console.log('2) itemDomEl', itemDomEl);
					if (!itemDomEl) {
						var item_tag_name = 'div';
						var dv_tag_name = item.dom.tagName;
						// no, it's dom.tag_name
						if (dv_tag_name) {
							item_tag_name = dv_tag_name;
						}
						var temp_el;
						//console.log('item_tag_name', item_tag_name);
						if (item_tag_name == 'circle' || item_tag_name == 'line' || item_tag_name == 'polyline') {
							// Can make SVG inside an element, with the right namespace.

							// TODO Maybe we can have a global temporary SVG container.
							var temp_svg_container = e_change.item.context.document.createElement('div');
							temp_svg_container.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">' + e_change.item.all_html_render() + '</svg>';
							itemDomEl = temp_svg_container.childNodes[0].childNodes[0];
							//
							//itemDomEl = e_change.item.context.document.createElementNS("http://www.w3.org/2000/svg", item_tag_name);
							//console.log('itemDomEl', itemDomEl);
							//throw 'stop';
						} else {
							temp_el = e_change.item.context.document.createElement('div');
							temp_el.innerHTML = e_change.item.all_html_render();
							itemDomEl = temp_el.childNodes[0];
						}
						//item.el = itemDomEl;

						//e_change.item.set('dom.el', itemDomEl);
                        e_change.item.dom.el = itemDomEl;

						item.active();
					};
				}

				var t_item_dom_el = tof(itemDomEl);

				if (t_item_dom_el === 'string') {
					itemDomEl = document.createTextNode(itemDomEl);
				}

				if (!el) {

					/*

					//console.log('*** that._id()', that._id());
					var grandparent = that.parent().parent();
					//console.log('grandparent', grandparent);
					grandparent.rec_desc_ensure_ctrl_el_refs();
					el = context.map_els[that._id()];
					//console.log('el', el);
					that.dom.el = el;

					*/


				}
				el.appendChild(itemDomEl);
			}
			if (type === 'clear') {
				if (el) el.innerHTML = '';
			}
		});
		//console.log('2) content.length()', content.length());
	}

	// Defining X11 colors in a compressed way would be cool. Compressed data, goes to tensor / manifold nexus structure.
	//  Enabling that manifold nexus structure to have string labels would help too.
	//   Though could have an index of strings at numeric keys.


	/*
	'rec_desc_reattach_dom_events'() {
		var el = this.dom.el;
		if (!el) {
			throw 'missing this.dom.el';
		} else {

		}

	}
	*/

	'rec_desc_ensure_ctrl_el_refs'(el) {
		el = el || this.dom.el;
		var context = this.context;
		var that = this;
		if (el) {
			var c, l, cns;
			var jsgui_id;

			var map_els = {};

			dom_desc(el, function(el) {
				//console.log('dom_desc el', el);
				if (el.getAttribute) {
					jsgui_id = el.getAttribute('data-jsgui-id');
					//console.log('rec_desc_ensure_ctrl_el_refs found jsgui_id', jsgui_id);
					if (jsgui_id) {
						//map_controls[jsgui_id] = el;
						// Make a map of elements...?
						map_els[jsgui_id] = el;
						context.map_els[jsgui_id] = el;
					}
				}
			});

			desc(this, function(ctrl) {
				// ensure the control is registered with the context.
				//console.log('desc ctrl', ctrl);
				var t_ctrl = tof(ctrl);
				//console.log('t_ctrl', t_ctrl);
				if (ctrl !== that && t_ctrl === 'control') {
					var id = ctrl._id();
					//console.log('id', id);
					// Seems like it's not in the map.
					//console.log('map_els[id]', !!map_els[id]);
					if (map_els[id]) {

						

						if (ctrl.dom.el !== map_els[id]) {
							ctrl.dom.el = map_els[id];

							// attach the DOM events.
							//console.log('ctrl.bound_event_handlers', ctrl.bound_event_handlers);


						} else {
							//console.log('Already in the map');

							// Could rebind the events here?
						}

						//console.log('map_els[id]', map_els[id]);
						//ctrl.set('dom.el', map_els[id]);

						//ctrl._.el = map_els[id];
					}
					//ctrl.activate();
				}
			});
		}
	}

	'rec_desc_activate'() {
		desc(this, function(ctrl) {
			// ensure the control is registered with the context.
			//console.log('desc ctrl', ctrl);
			var t_ctrl = tof(ctrl);

			if (t_ctrl === 'control') {
				ctrl.activate();
			}
		});
	}

	'activate_content_controls'() {
		// This could do with some enhancement, so that it automatically does a recursive activation.
		// ensure content dom el refs
		//  recursively ensures the DOM node references for the elements inside.
		var el = this.dom.el;

		if (el) {
			var context = this.context;
			var ctrl_fields = {};
			var that = this;
			var c, l;
			var my_content = this.content;
			var str_ctrl_fields = el.getAttribute('data-jsgui-ctrl-fields');
			if (str_ctrl_fields) {
				//console.log('str_ctrl_fields ' + str_ctrl_fields);
				ctrl_fields = JSON.parse(str_ctrl_fields.replace(/'/g, '"'));
			}
			var ctrl_fields_keys = Object.keys(ctrl_fields);
			//console.log('ctrl_fields_keys', ctrl_fields_keys);

			var l_ctrl_fields_keys = ctrl_fields_keys.length;
			var key, value;
			for (c = 0; c < l_ctrl_fields_keys; c++) {
				key = ctrl_fields_keys[c];
				value = ctrl_fields[key];

				var referred_to_control = context.map_controls[value];
				//console.log('referred_to_control', referred_to_control);

				//that.set(key, referred_to_control);

				// The underscore thing may work better as it could be a proxy object.



				that[key] = referred_to_control;

			}
			var cns = el.childNodes;
			var content = this.content;
			// Adding the content again?
			//console.log('cns', cns);
			//console.log('cns.length', cns.length);
			for (c = 0, l = cns.length; c < l; c++) {
				var cn = cns[c];

				if (cn) {
					var nt = cn.nodeType;
					//console.log('* nt ' + nt);
					if (nt == 1) {
						var cn_jsgui_id = cn.getAttribute('data-jsgui-id');
						//console.log('cn_jsgui_id ' + cn_jsgui_id);
						var cctrl = context.map_controls[cn_jsgui_id];
						// quick check to see if the control is not already there.
						var found = false;
						if (cctrl) {
							var ctrl_id = cctrl.__id;
							//console.log('* ctrl_id', ctrl_id);
							if (ctrl_id) {
								content.each(function(v, i) {
									if (v.__id) {
										if (v.__id == ctrl_id) found = true;
									}
								});
							}

							if (!found) {
								my_content.add(cctrl);
							}
							//cctrl.activate();
						}
					}
					if (nt == 3) {
						// text
						var val = cn.nodeValue;
						//console.log('val ' + val);
						content.push(val);
					}
				}
			}
		}
		this.rec_desc_activate();
	}

	'activate_dom_attributes'() {
		// Needs to get the class out of the DOM properly.
		//console.log('activate_dom_attributes');

		var el = this.dom.el;

		//console.log('** el', el);
		// may not have el....?
		var that = this;
		var dom_attributes = this.dom.attributes;

		if (el) {
			for (var i = 0, attrs = el.attributes, l = attrs.length; i < l; i++){
				//arr.push(attrs.item(i).nodeName);
				var item = attrs.item(i);
				var name = item.name;
				var value = item.value;
				//console.log('name', name);

				if (name == 'data-jsgui-id') {
					// Handled elsewhere - not so sure it should be but won't change that right now.
				} else if (name == 'data-jsgui-type') {
					// ^
				} else if (name == 'style') {
					var map_inline_css = this._icss;
					var arr_style_items = value.split(';');
					//console.log('arr_style_items', arr_style_items);

					//each(arr_style_items)
					for (var c = 0, l2 = arr_style_items.length; c < l2; c++) {
						//map_inline_css[]

						var style_item = arr_style_items[c];
						//var style_item_name =
						var arr_style_item = style_item.split(':');

						if (arr_style_item[0]) {
							map_inline_css[arr_style_item[0]] = arr_style_item[1];
						}
					}
					//} else if (name == 'data-jsgui-fields') {
					// Should probably rely on using init a lot more now.
					//    var str_properties = value;

					//    if (str_properties) {

					//    }
				} else {
					// set the dom attributes value... silent set?

					//dom_attributes.set(name, value);

                    dom_attributes[name] = value;
				}
			}
		}
	}

	'attach_dom_events'() {
		// Attaches the bound events to the DOM.
		//  Called after the control has been assigned an element.

		console.log('attach_dom_events');
		var that = this;

		each(this._bound_events, (handlers, name) => {
			each(handlers, (handler) => {
				console.log('event name', name);
				//console.log('handler', handler);
				//console.trace();

                // add_dom_event_listener
                that.add_dom_event_listener(name, handler);

				//that.add_event_listener(name, handler);
			});
		});

	}

	'hide'() {
		console.log('hide');
		this.add_class('hidden');
	}
	'show'() {
		console.log('show');
		this.remove_class('hidden');
	}

	'descendants'(search) {
		// assembles a list of the descendents that match the search
		//  (search by .__type_name)
		// eg get a list of menu_node objects.
		// basically need to recursively go through the descendents, with a callback in here, and see if they match the search.
		// recursive iteration of the control(s)

		var recursive_iterate = function(ctrl, item_callback) {
			// callback on all of the child controls, and then iterate those.
			//console.log('recursive_iterate');
			var content = ctrl.content;
			//console.log('content', content);

			var t_content = tof(content);

			//console.log('t_content', t_content);

			if (t_content == 'collection') {
				if (content.length() > 0) {

					//console.log('content.length()', content.length());
					// iterate through those child nodes as well.
					content.each(function(item, i) {
						//console.log('item', item);
						item_callback(item);
						recursive_iterate(item, item_callback);

					})
				}
			}
		}
		var arr_matching = [];
		recursive_iterate(this, function(item) {
			// see if the item matches the search

			//console.log('cb item', item);
			var item_type = item.__type_name;
			//console.log('item_type', item_type);

			if (item_type == search) {
				arr_matching.push(item);
			} else {
				//return ctrl_parent.ancestor(search);
			}
		});
		//console.log('arr_matching', arr_matching);
		return arr_matching;
	}

	'ancestor'(search) {
		// could maybe work when not activated too...
		// need to get the ancestor control matching the search (in type).
		if (this._parent) {
			var ctrl_parent = this._parent._parent;
			// the _parent is a Collection within the parent Control
			if (!ctrl_parent) {
				return false;
			} else {
				//console.log('ctrl_parent', ctrl_parent);
				// does the parent match the type?

				var parent_type = ctrl_parent.__type_name;
				//console.log('parent_type', parent_type);

				if (parent_type == search) {
					return ctrl_parent;
				} else {
					return ctrl_parent.ancestor(search);
				}
			}
		} else {
			return false;
		}
	}

	/*
	'context_menu'() {
		var a = arguments; a.l = arguments.length; var sig = get_a_sig(a, 1);
		var menu_def;
		if (sig == '[o]' || sig == '[a]') {
			menu_def = a[0];
		}
		//var Context_Menu = Context_Menu || require('./controls/advanced/context-menu');


		var context_menu;
		var that = this;
		// Need it so that the context menu gets removed when it should.
		//  Any mouseup event causes it to vanish.
		var body = this.context.body;
		//var ctrl_html_root = this.context.ctrl_document;
		//console.log('ctrl_html_root', ctrl_html_root);
		//var body = ctrl_html_root.body();
		var show_context_menu = fp(function(a, sig) {
			var pos;
			if (sig == '[a]') {
				// A position?
				pos = a[0];
			}
			if (!context_menu) {
				//console.log('creating new context menu');

				//console.log('menu_def', menu_def);

				context_menu = new Context_Menu({
					'context': that.context,
					'value': menu_def
				});

				if (pos) {
					context_menu.style({
						'left': (pos[0] - 1) + 'px',
						'top': (pos[1] - 1) + 'px'
					});

				} else {
					context_menu.style({
						'left': '100px',
						'top': '100px'
					});

				}
				var context = that.context;
			} else {

				if (pos) {
					context_menu.style({
						'left': (pos[0] - 1) + 'px',
						'top': (pos[1] - 1) + 'px'
					});
				} else {
					context_menu.style({
						'left': '100px',
						'top': '100px'
					});
				}
			}
			setTimeout(function() {
				body.add(context_menu);
				//console.log('pre activate context_menu._.content._arr.length ' + context_menu._.content._arr.length);
				context_menu.activate();
				context_menu.one_mousedown_anywhere(function(e_mousedown) {
					//console.log('e_mousedown.within_this ' + e_mousedown.within_this);

					if (!e_mousedown.within_this) {
						context_menu.remove();
					} else {
						// maybe open a new level.

						// And need to call the relevant context menu function.

						console.log('e_mousedown', e_mousedown);

						var el_target = e_mousedown.target;
						// the target control will have a jsgui id now.
						//  we should be able to then go to its parent and get its menu node.
						var context = that.context;
						console.log('context', context);
						var target_id = el_target.getAttribute('data-jsgui-id');
						console.log('target_id', target_id);
						var ctrl_target = context.map_controls[target_id];
						console.log('ctrl_target', ctrl_target);
						// want to be able to get an ancestor of type menu-node
						var menu_node = ctrl_target.ancestor('menu_node');
						console.log('menu_node', menu_node);
						// and raise the menu_node select event.
						menu_node.raise('select');
						context_menu.remove();
					}
				});
			}, 0);
		});

		this.on('contextmenu', function(e_contextmenu) {
			//console.log('e_contextmenu', e_contextmenu);
			return false;
			//console.log('e_click', e_click);
		})

		this.on('mousedown', function(e_mousedown) {
			//console.log('e_mousedown', e_mousedown);
			var int_button = e_mousedown.which;
			if (int_button == 3) {
				e_mousedown.preventDefault();
				window.event.returnValue = false;
				return false;
			}
		});

		this.on('mouseup', function(e_mouseup) {
			//console.log('e_mouseup', e_mouseup);
			var int_button = e_mouseup.which;

			if (int_button == 3) {
				console.log('right button');
				e_mouseup.preventDefault();
				window.event.returnValue = false;
				// Need to work out the position of the click.
				// pageX, pageY
				var pos = [e_mouseup.pageX, e_mouseup.pageY];
				show_context_menu(pos);
				return false;
			}
		})
	}
	*/
	// make full height.
	//  makes the control take the rest of the height of the window.
	// Drag function as well...
	//  Could make this accept the same params as the drag function,
	//   but this version will be more flexible with more modes.
	// Drag and drop could also be set up with simpler parameters and acts in the default way that .drag would do.

	'draggable'() {
		var a = arguments; a.l = arguments.length; var sig = get_a_sig(a, 1);
		var that = this;
		//console.log('draggable sig', sig);
		//console.trace();
		var options = {}, mode, drag_start_distance = 4;
		// options could contain event handlers.
		//  Not sure about the publish / subscribe model.
		//   Maybe it would work well.
		// But allowing event handlers as specified in the options would be good as well.
		var fn_mousedown, fn_dragstart, fn_dragmove, fn_dragend;
		var handle_mousedown, handle_dragstart, handle_dragmove , handle_dragend;

		if (sig == '[o]') {
			options = a[0];
		}

		// fn_mousedown, fn_begin, fn_move, fn_end
		if (sig == '[f,f,f,f]') {
			handle_mousedown = a[0];
			handle_dragstart = a[1];
			handle_dragmove = a[2];
			handle_dragend = a[3];
		}


		if (options.mode) mode = options.mode;
		//if (options.fn_dragmove) fn_dragmove = options.fn_dragmove;
		if (options.move) handle_dragmove = options.move;
		//if (options.fn_dragstart) fn_dragstart = options.fn_dragstart;
		if (options.start) handle_dragstart = options.start;

		// could have a 'none' mode that does not implement drag behaviour itself, but just shows the events?
		//  or I think 'events' mode would be a better name because it's saying what it is.
		//  would be useful for moving objects around according to more specific rules.

		if (mode == 'ghost-copy') {
			console.log('ghost-copy drag');
		}

		var body = that.context.body();
		// raise the events externally.
		var is_dragging;
		var pos_mousedown;

		var ghost_clone;
		var fn_mousemove = function(e_mousemove) {
			//console.log('e_mousemove', e_mousemove);
			var pos = [e_mousemove.pageX, e_mousemove.pageY];
			var pos_offset = [pos[0] - pos_mousedown[0], pos[1] - pos_mousedown[1]];

			//console.log('dist', dist);
			//console.log('is_dragging ' + is_dragging);

			if (!is_dragging) {
				var dist = Math.round(Math.sqrt(pos_offset[0] * pos_offset[0] + pos_offset[1] * pos_offset[1]));
				if (dist >= drag_start_distance) {
					//console.log('starting drag');
					is_dragging = true;
					// in ghost copy mode create the ghost copy
					if (mode == 'ghost-copy') {
						ghost_clone = that.absolute_ghost_clone();
					}
					if (handle_dragstart) {
						e_mousemove.control = that;
						// set the body's css cursor to 'default'
						//body.style('cursor', 'default');
						body.add_class('no-text-select')
						body.add_class('default-cursor');
						//body.add_class('dragging');
						handle_dragstart(e_mousemove);
					}
				}
			}
			if (is_dragging) {
				// raise the drag event.
				// could do some of the drag-drop activity depending on the drag mode.
				//  also want to provide other hooks for functionality.
				// console.log('fn_dragmove', fn_dragmove);
				if (handle_dragmove) {
					e_mousemove.control = that;
					//console.log('e_mousemove', e_mousemove);
					handle_dragmove(e_mousemove);
				}
			}
			// Want the offset from the mousedown position.
		}
		var fn_mouseup = function(e_mouseup) {
			//console.log('e_mouseup', e_mouseup);
			//console.log('pre switch off mousemove, mouseup');
			// Seems the events are being added too many times.
			body.off('mousemove', fn_mousemove);
			body.off('mouseup', fn_mouseup);
			body.remove_class('no-text-select');
			body.remove_class('default-cursor');
			//body.remove_class('dragging');
		}
		this.on('mousedown', function(e_mousedown) {
			//console.log('e_mousedown', e_mousedown);
			pos_mousedown = [e_mousedown.pageX, e_mousedown.pageY];
			// position within Control
			// position within window
			body.on('mousemove', fn_mousemove);
			body.on('mouseup', fn_mouseup);
			body.add_class('no-text-select');
			is_dragging = false;
			if (handle_mousedown) {
				handle_mousedown(e_mousedown);
			}
		})
	}

	'drag_handle_to'(ctrl) {
		var mousedown_offset_from_ctrl_lt;
		var ctrl_el = ctrl.dom.el;
		// could go in enhanced....
		//this.drag(function(e_mousedown) {
		this.draggable(function(e_mousedown) {
			//console.log('e_mousedown', e_mousedown);
			// This will need to be revised - making adjustment for when dragging from an anchored position.
			//  Should maintain some info about the drag so it knows if it starts/ends anchored anywhere.
			var target = e_mousedown.target;
			var targetPos = findPos(target);
			//console.log('targetPos ' + stringify(targetPos));
			var el_ctrl = ctrl.value('dom.el');
			var ctrl_el_pos = findPos(el_ctrl);
			var e_pos_on_page = [e_mousedown.pageX, e_mousedown.pageY];
			mousedown_offset_from_ctrl_lt = jsgui.v_subtract(e_pos_on_page, ctrl_el_pos);

		}, function(e_begin) {
			var ctrlSize = ctrl.size();
			//console.log('ctrlSize', ctrlSize);
			var anchored_to = ctrl.anchored_to;
			//console.log('anchored_to', anchored_to);
			if (!anchored_to) {
				//ctrl.set('unanchored_size', ctrlSize);
			} else {
				// need to unanchor it.
				ctrl.unanchor();
			}
		}, function(e_move) {
			var clientX = e_move.clientX;
			var clientY = e_move.clientY;
			var window_size = get_window_size();
			//console.log('mousedown_offset_from_ctrl_lt', mousedown_offset_from_ctrl_lt);
			var ctrl_pos = jsgui.v_subtract([clientX, clientY], mousedown_offset_from_ctrl_lt);

			// But then act differently if we are dragging from an anchored position.
			//  The mousedown offset within the control won't be so relevant -
			//   or won't be the only factor.
			// Take account of position_adjustment
			//  or offset_adjustment

			var offset_adjustment = ctrl.offset_adjustment;
			if (offset_adjustment) {
				// want to find out what zone it is anchored in.

				ctrl_pos = jsgui.v_add(ctrl_pos, offset_adjustment);

				//
			}
			if (ctrl_pos[0] < 0) ctrl_pos[0] = 0;
			if (ctrl_pos[1] < 0) ctrl_pos[1] = 0;
			var ow = ctrl_el.offsetWidth;
			var oh = ctrl_el.offsetHeight;


			if (ctrl_pos[0] > window_size[0] - ow) ctrl_pos[0] = window_size[0] - ow;
			if (ctrl_pos[1] > window_size[1] - oh) ctrl_pos[1] = window_size[1] - oh;

			var style_vals = {
				'left': ctrl_pos[0] + 'px',
				'top': ctrl_pos[1] + 'px'
			};
			//console.log('style_vals', style_vals);
			ctrl.style(style_vals);
			ctrl.context.move_drag_ctrl(e_move, ctrl);
		}, function(e_end) {
			// tell the context that the drag has ended.
			var uo1 = ctrl.unanchored_offset;
			//console.log('uo1', uo1);
			ctrl.context.end_drag_ctrl(e_end, ctrl);
			var uo2 = ctrl.unanchored_offset;
			//console.log('uo2', uo2);
			if (uo1 && uo2) {
				ctrl.unanchored_offset = null;
			}
			ctrl.offset_adjustment = null;
			// and if it already has an unanchored_offset
		});
	}
	'resize_handle_to'(ctrl, handle_position) {
		// The control needs to be draggable normally?
		//  And then from the positions of where it is adjust the size of what it's a resize handle to?
		//console.log('resize_handle_to');
		if (handle_position == 'right-bottom') {
			/*
			var fn_move = function(e_move) {
				console.log('e_move', e_move);
			}
			var fn_up = function(e_up) {
				console.log(e_up);
			}
			*/
			var doc = ctrl.context.ctrl_document;
			//console.log('ctrl.context', ctrl.context);
			var fn_move = function(e_move) {
				//console.log('e_move', e_move);
			}
			var fn_up = function(e_up) {
				//console.log('e_up', e_up);

				doc.off('mousemove', fn_move);
				doc.off('mouseup', fn_up);
			}
			ctrl.on('mousedown', function(e_mousedown) {
				//console.log('e_mousedown', e_mousedown);
				doc.on('mousemove', fn_move);
				doc.on('mouseup', fn_up);
			})
		}
	}

	'selectable'(ctrl) {
		var that = this;
		ctrl = ctrl || this;

		if (typeof document === 'undefined') {
			//that._fields = that._fields || {};
			//that._fields['is_selectable'] = true;
			that.is_selectable = true;

		} else {

			that.click(function(e) {
				var ctrl_key = e.ctrlKey;
				var meta_key = e.metaKey;
				if (ctrl_key || meta_key) {
					ctrl.action_select_toggle();
				} else {
					ctrl.action_select_only();
				}
			});
		}
	}

	'action_select_only'() {
		var ss = this.find_selection_scope();
		//console.log('ss', ss);
		ss.select_only(this);
		//this.find_selection_scope().select_only(this);
	}

	'action_select_toggle'() {
		this.find_selection_scope().select_toggle(this);
	}

	// So I think the resource-pool will have a selection scope.
	'find_selection_scope'() {
		//console.log('find_selection_scope');
		var res = this.selection_scope;
		if (res) return res;
		if (this.parent) return this.parent.find_selection_scope();
	}

	// Nice, this works. Not that efficiently yet.

	'make_full_height'() {
		var el = this.dom.el;
		var viewportHeight = document.documentElement.clientHeight;
		var rect = el.getBoundingClientRect();
		console.log(rect.top, rect.right, rect.bottom, rect.left);
		var h = viewportHeight - rect.top;
		this.style('height', h + 'px', true);
	}
	'unanchor'() {
		var anchored_to = this.get('anchored_to');
		anchored_to[0].unanchor_ctrl(this);
	}
};

module.exports = Control;

// Adds to jsgui itself...
//  It adds a whole number of default controls.
//  Could that be anywhere else?
