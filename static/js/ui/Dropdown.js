define(['jquery', 'util/_','bootstrap'], function($, _){
    
    function Dropdown(options, callback){
      this._options= options;
      this.callback= callback;
      this.value   = options[0] || '' ;
      
      this.button  = mkButton(this.value);
      this.drop    = mkDrop(options, _.partial(updatingButtonLabel, this));
      
      this.tag   = $("<div class='btn-group'></div>");
      this.tag.append(this.button);
      this.tag.append(this.drop);
    };
    
    Dropdown.prototype.val = function(){
        if(arguments.length>0){
            this.value = arguments[0];
            this.button.html(mkButtonText(this.value)); 
            this.callback(this.value); 
        }
        return this.value;
    };
    Dropdown.prototype.appendTo = function(target){
        this.tag.appendTo(target);
    };
    
    Dropdown.prototype.remove = function(){
        $(this.tag).remove();
    };
    
    Dropdown.prototype.options = function(){
       return this._options;
    };
    
    function updatingButtonLabel(self, val){
       self.val(val);
    };
    
    function mkButton(text){
        return $(
        "<button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown'>" +
          mkButtonText(text) + 
        "</button>");
    };
    function mkButtonText(text){
       return text + mkCaret(); 
    };
    function mkCaret(){
      return "<span class='caret' style='margin-left: 1em'></span>";
    };
    function mkDrop(options, callback){
        var drop = $("<ul class='dropdown-menu'></ul>");
        _.each(options, function(opt){
           drop.append(mkOption(opt, callback)); 
        });
        return drop;
    };
    function mkOption(option,callback){
        var link = $("<a style='cursor: pointer'>"+option+'</a>');
        var opt  = $("<li></li>").append(link);
        link[0].onclick = _.partial(callback, option);
        return opt;
    };
    
    return Dropdown;
});