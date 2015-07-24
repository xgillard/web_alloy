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
    
    var createdropdown = _.new(drop);
    var createwaitpopup= _.new(wait);
    
    function checkbox(name, callback){
        var $chk = $("<input type='checkbox' name='"+name+"' />");
        $chk.on("changed", function(){callback($chk.prop('changed'));});
        return $chk;
    };
    
    function button(label, callback, kind){
        var style= kind || 'default'; 
        var $btn = $("<button type='button' class='btn btn-"+style+"'>"+label+"</button>");
        $btn[0].onclick = callback;
        return $btn;
    };
    
    return {
        Button  : button,
        Checkbox: checkbox,
        Dropdown: createdropdown,
        Alert   : _alert,
        Wait    : createwaitpopup
    };
});