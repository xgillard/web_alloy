define(
  ['jquery','util/_', 'ui/Dropdown', 'ui/PleaseWait', 'ui/Editor', 'ui/MultiEditor', 'ui/ShareDialog', 'bootstrap'],
  function($,_, drop, wait, Editor, MultiEditor){
    
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
    
    var createdropdown    = _.new(drop);
    var createwaitpopup   = _.new(wait);
    
    function simplecheckbox(name, callback){
        var $chk  = $("<input type='checkbox' name='"+name+"' />");
        $chk[0].onchange = callback;
        return $chk;
    };
    
    function labeledcheckbox(name, callback){
        var $span = $("<span />").text(name);
        var $chk  = $("<input type='checkbox' name='"+name+"' />");
        //
        $chk[0].onchange = callback;
        //
        return $("<label />").append($span).append($chk);
    };
    
    function button(label, callback, classes){
        var styles = _.isEmpty(classes) ? ['btn-default'] : classes; 
        var $btn   = $("<button type='button' class='btn'>"+_.escape(label)+"</button>");
        $btn[0].onclick = callback;
        _.each(styles, function(s){$btn.addClass(s);});
        return $btn;
    };
    
    function text(name, onchange){
        var $input = $("<input type='text' class='form-control' name='"+name+"'/>");
        $input[0].onchange = onchange;
        return $input;
    };
    
    function number(name, onchange){
        var $input = $("<input type='number' class='form-control' pattern='\\d+' name='"+name+"'/>");
        $input.attr("min", 0);
        $input[0].onchange = onchange;
        return $input;
    };
    
    function color(name, onchange){
        var $input = $("<input type='color' class='form-control' name='"+name+"'/>");
        $input.attr("min", 0);
        $input[0].onchange = onchange;
        return $input;
    };
    
    return {
        Text           : text, 
        Number         : number,
        Color          : color,
        Button         : button,
        SimpleCheckbox : simplecheckbox,
        LabeledCheckbox: labeledcheckbox,
        Dropdown       : createdropdown,
        Alert          : _alert,
        Editor         : _.new(Editor),
        MultiEditor    : _.new(MultiEditor),
        Wait           : createwaitpopup
    };
});