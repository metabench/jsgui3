var jsgui = require('../html/html');

jsgui.Resource_Pool = require('./client-resource-pool');
jsgui.Client_Page_Context = require('./page-context');
//console.log('jsgui.Client_Page_Context', jsgui.Client_Page_Context);
jsgui.Selection_Scope = require('./selection-scope');
// And then can automatically activate?
//




if (typeof window !== 'undefined') {

    // make some client-side jsgui functionality.
    jsgui.http = (url, callback) => {
        var oReq = new XMLHttpRequest();
        //console.log('jsgui.http url', url);
        oReq.onload = function (res) {
            console.log('oReq.responseText ' + oReq.responseText);

            //var objResponse = JSON.parse(oReq.responseText);

            // Then for each of them we create an object.



        };
        oReq.open("get", url, true);
        oReq.send();
    }



    let activate = () => {

        page_context = new jsgui.Client_Page_Context({
            'document': document
        });


        jsgui.register_ctrl = (type_name, ctrl_name, Ctrl) => {
            console.log('register_ctrl type_name, ctrl_name', type_name, ctrl_name);
            jsgui[ctrl_name] = Ctrl;
            page_context.update_Controls(type_name, Ctrl);

        }




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
                page_context.update_Controls('list', jsgui.List);
                page_context.update_Controls('item', jsgui.Item);
                page_context.update_Controls('combo_box', jsgui.Combo_Box);
                page_context.update_Controls('popup_menu_button', jsgui.Popup_Menu_Button);
                page_context.update_Controls('color_palette', jsgui.Color_Palette);
                page_context.update_Controls('grid', jsgui.Grid);

                jsgui.activate(page_context);
            }
            early_load_and_activate();






        }
    }

    activate();
}



module.exports = jsgui;