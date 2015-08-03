define(
  ['jquery','util/_', 'ui/Dropdown', 'ui/PleaseWait', 'ui/MultiState', 'ui/InstanceView','bootstrap'],
  function($,_, drop, wait, multistate, instanceview){
    
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
    var createmultistate  = _.new(multistate);
    var createinstanceview= _.new(instanceview);
    
    function FlipFlop(on, off, callback){
      var labels = [on,   off];
      var values = [true, false];
      var styles = ['btn-primary', 'btn-default'];
      return createmultistate(labels, values, styles, callback);  
    };
    
    function TriState(mdl, callback){
      var labels = _.keys(mdl);
      var values = _.values(mdl);
      var styles = ['btn-primary', 'btn-info','btn-default'];
      return createmultistate(labels, values, styles, callback);  
    };
    
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
        MultiState     : createmultistate,
        FlipFlop       : FlipFlop,
        TriState       : TriState,
        LabeledCheckbox: labeledcheckbox,
        Dropdown       : createdropdown,
        Alert          : _alert,
        Wait           : createwaitpopup,
        InstanceView   : createinstanceview
    };
});