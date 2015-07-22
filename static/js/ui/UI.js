define(
  ['jquery','util/_', 'ui/Dropdown', 'ui/PleaseWait', 'bootstrap'],
  function($,_, drop, wait){
    
    function _alert(type, mesg){
        return "<div class='alert alert-dismissible alert-"+type+"' role='alert'>"+
        "<button type='button' class='close' data-dismiss='alert'>&times;</button>"+
        mesg +
        "</div>";
    };
        
    return {
        Alert   : _alert,
        Dropdown: drop,
        Wait    : wait
    };
});