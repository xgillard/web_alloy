define(['jquery', 'util/_','bootstrap'], function($, _){
    
    function Dropdown(options, callback){
      this.value   = options[0];
      this.callback= callback;
      this.button  = mkButton(this.value);
      this.drop    = mkDrop(options, _.partial(updatingButtonLabel, this));
      
      this.tag   = $("<div class='btn-group'></div>");
      this.tag.append(this.button);
      this.tag.append(this.drop);
      
      return this.tag;
    };
    
    Dropdown.prototype.val = function(){
        if(arguments.length>0){
            this.value = arguments[0];
        }
        return this.value;
    };
    Dropdown.prototype.appendTo = function(target){
        this.tag.appendTo(target);
    };
    
    Dropdown.prototype.remove = function(){
        $(this.tag).remove();
    };
    
    function updatingButtonLabel(self, val){
       self.value = val;
       self.button.html(mkButtonText(val)); 
       self.callback(val); 
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
        var link = $("<a style='cursor: pointer'>"+option+'</a>').click(_.partial(callback, option));
        var opt  = $("<li></li>").append(link);
        return opt;
    };
    
    return Dropdown;
});