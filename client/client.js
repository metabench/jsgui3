var jsgui = require('../html/html');

jsgui.Resource_Pool = require('./client-resource-pool');
jsgui.Client_Page_Context = require('./page-context');
//console.log('jsgui.Client_Page_Context', jsgui.Client_Page_Context);
jsgui.Selection_Scope = require('./selection-scope');
// And then can automatically activate?
//

jsgui.Client_Resource = require('./resource');

const fnl = require('fnl');
const prom_or_cb = fnl.prom_or_cb;



if (typeof window !== 'undefined') {

    const textToArrayBuffer = (textBuffer, startOffset = 0) => {
        var len = textBuffer.length - startOffset;
        var arrayBuffer = new ArrayBuffer(len);
        var ui8a = new Uint8Array(arrayBuffer, 0);
        for (var i = 0, j = startOffset; i < len; i++, j++)
            ui8a[i] = (textBuffer.charCodeAt(j) & 0xff);

        let buf = new Buffer(arrayBuffer);
        return buf;
    }


    jsgui.http = (url, callback) => {
        return prom_or_cb((resolve, reject) => {
            var oReq = new XMLHttpRequest();
            //console.log('jsgui.http url', url);

            /*
            oReq.onload = function (res) {
                //console.log('oReq.responseText ' + oReq.responseText);

                // But is it text?

                //let buf = textToArrayBuffer(oReq.responseText);

                console.log('Object.keys(oReq)', Object.keys(oReq));


                // Will need to work on client-side buffer processing.
                //  Will need to turn this buffer / ArrayBuffer into a Model.
                //  But not here.

                //console.log('buf', buf);

                //console.log('pre cb client http');
                //callback(null, buf);

                console.log('res', res);
                console.log('Object.keys(res)', Object.keys(res));

                //var objResponse = JSON.parse(oReq.responseText);

                // Then for each of them we create an object.



            };
            */

            oReq.onreadystatechange = function() {
                if (this.readyState == 4) {
                    console.log('this.status', this.status);

                    if (this.status == 200) {
                        var o = JSON.parse(this.responseText);
                        //myFunction(myArr);
                        resolve(o);
                    } else {
                        reject(this.status);
                    }
                }
            };

            oReq.open("get", url, true);
            oReq.send();
        }, callback);
    }

    /*

    // make some client-side jsgui functionality.
    jsgui.http = (url, callback) => {



        var oReq = new XMLHttpRequest();
        //console.log('jsgui.http url', url);
        oReq.onload = function (res) {
            //console.log('oReq.responseText ' + oReq.responseText);

            // But is it text?

            let buf = textToArrayBuffer(oReq.responseText);

            // Will need to work on client-side buffer processing.
            //  Will need to turn this buffer / ArrayBuffer into a Model.
            //  But not here.

            //console.log('buf', buf);

            console.log('pre cb client http');
            callback(null, buf);


            //var objResponse = JSON.parse(oReq.responseText);

            // Then for each of them we create an object.



        };
        oReq.open("get", url, true);
        oReq.send();
    }
    */



    let activate = () => {

        page_context = new jsgui.Client_Page_Context({
            'document': document
        });



        // 


        // maybe need a different register function.

        /*

        jsgui.register_ctrl = (type_name, ctrl_name, Ctrl) => {
            console.log('register_ctrl type_name, ctrl_name', type_name, ctrl_name);
            jsgui[ctrl_name] = Ctrl;
            page_context.update_Controls(type_name, Ctrl);

        }
        */




        // Set up a variety of UI controls here.

        // May be worth looking at some registry of controls.


        window.onload = function () {
            //console.log('pre activate');
            //setTimeout(() => {

            //}, 1000);
            //console.log('!!jsgui.Toggle_Button', !!jsgui.Toggle_Button);

            // A way to have the controls registered by name.
            // foo.constructor.name
            //  then make it lower case.

            // Could go through every object in jsgui, seeing if it's a control.

            var early_load_and_activate = function () {
                page_context.update_Controls('text_field', jsgui.Text_Field);
                page_context.update_Controls('text_item', jsgui.Text_Item);


                page_context.update_Controls('resize_handle', jsgui.Resize_Handle);
                page_context.update_Controls('toggle_button', jsgui.Toggle_Button);
                page_context.update_Controls('start_stop_toggle_button', jsgui.Start_Stop_Toggle_Button);
                page_context.update_Controls('plus_minus_toggle_button', jsgui.Plus_Minus_Toggle_Button);
                page_context.update_Controls('list', jsgui.List);
                page_context.update_Controls('item', jsgui.Item);
                page_context.update_Controls('combo_box', jsgui.Combo_Box);
                page_context.update_Controls('popup_menu_button', jsgui.Popup_Menu_Button);
                page_context.update_Controls('color_palette', jsgui.Color_Palette);
                page_context.update_Controls('grid', jsgui.Grid);

                jsgui.activate(page_context);
                console.log('post jsgui activate');
            }
            early_load_and_activate();


        }
    }

    activate();
}



module.exports = jsgui;