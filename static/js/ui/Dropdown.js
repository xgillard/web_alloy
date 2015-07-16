define(['jquery', 'util/_', 'viz/Viz'], function($, _){
    
    function Dropdown(options, callback){
        this.dropdown= dropdown(options, callback);
    };
    
    Dropdown.prototype.appendTo = function(selector){
        $(selector).append(this.dropdown);
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
        var dropdown = $("<select></select>");
        _.each(options, function(l){
            dropdown.append("<option value='"+l+"'>"+l+"</option>");
        });
        dropdown.on("change", callback);
        return dropdown;
    };
    
    return Dropdown;
});