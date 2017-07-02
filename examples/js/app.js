
//var jsgui = require('../../client/client');
jsgui = require('../../client/client');

//console.log('jsgui.Client_Page_Context', jsgui.Client_Page_Context);


page_context = new jsgui.Client_Page_Context({
    'document': document
});



// Set up a variety of UI controls here.




window.onload = function() {
    //console.log('pre activate');
    //setTimeout(() => {

    //}, 1000);

    //console.log('!!jsgui.Toggle_Button', !!jsgui.Toggle_Button);

    // A way to have the controls registered by name.

    // foo.constructor.name
    //  then make it lower case.

    // Could go through every object in jsgui, seeing if it's a control.

    
    var early_load_and_activate = function () {
        page_context.update_Controls('toggle_button', jsgui.Toggle_Button);
        page_context.update_Controls('list', jsgui.List);
        page_context.update_Controls('item', jsgui.Item);
        page_context.update_Controls('combo_box', jsgui.Combo_Box);
        page_context.update_Controls('popup_menu_button', jsgui.Popup_Menu_Button);

        jsgui.activate(page_context);
    }
    //early_load_and_activate();
    
    
    

    

}

//module.exports = jsgui;