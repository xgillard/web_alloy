define(['jquery', 'util/_','bootstrap'], function($, _){
    
    $.fn.shareDialog = function(){
      this.popover({
        title    : "Share your work using the following URL",
        html     : true,
        container: $(document.body),
        placement: 'bottom',
        content  : mkContent()
     });
    };
    
    function mkContent(){
        var div = $("<div></div>");
        div.css({width: '300px'});
        refresh(div);
        $(window).on("hashchange", _.partial(refresh, div));
        return div;
    };
    
    function mkInput(){
        var txt = $("<input type'text'></input>").val(window.top.location);
        txt.css({width: '300px'});
        return txt;
    };
    
    function refresh(self){
        self.html(mkInput());  
    };
    
    return $;
    
});