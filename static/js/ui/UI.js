define(
  ['jquery','util/_', 'ui/Dropdown', 'ui/PleaseWait', 'bootstrap'],
  function($,_, drop, wait){
    
    function _alert(type, mesg){
        var pop = 
                $("<div class='alert alert-dismissible alert-"+type+" fade in' role='alert'>"+
                    "<button type='button' class='close' data-dismiss='alert'>&times;</button>"+
                    mesg +
                  "</div>");
        $(document.body).append(pop);
        pop.alert();
        if(type==='success'){
            window.setTimeout(function(){
                pop.alert('close');
            }, 1500);
        }
    };
        
    return {
        Alert   : _alert,
        Dropdown: drop,
        Wait    : wait
    };
});