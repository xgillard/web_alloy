define(['jquery', 'util/_', 'viz/Viz'], function($, _){
    
    function Dropdown(options, callback){
        this._opts   = options;
        this.dropdown= dropdown(options, _.partial(call_with_my_val, this, callback));
    };
    
    Dropdown.prototype.options  = function(){
        return [].concat(this._opts);  
    };
    
    Dropdown.prototype.appendTo = function(target){
        this.dropdown.appendTo(target);
    };
    
    Dropdown.prototype.remove = function(){
        $(this.dropdown).remove();
    };
    
    Dropdown.prototype.val = function(){
        function get(){
            return this.dropdown.val();
        };
        function set(v){
            var prev = this.dropdown.val();
            if(prev === v) return;
            this.dropdown.val(v);
            this.dropdown.change();
        };
        
        var fn = arguments.length === 0 ? get : set;
        return fn.apply(this, arguments);
    };
    
    function dropdown(options, callback) {
        var dropdown = $("<select class='dropdown'></select>");
        _.each(options, function(l){
            dropdown.append("<option value='"+l+"'>"+l+"</option>");
        });
        dropdown[0].onchange = callback;
        return dropdown;
    };
    
    function call_with_my_val(self, fn){
        return fn(self.val());
    };
    
    return Dropdown;
});