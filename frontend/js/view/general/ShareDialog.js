define(['jquery', 'util/_','bootstrap'], function($, _){
    
    $.fn.shareDialog = function(app){
      var content  = mkContent();
      
      this.popover({
        title    : "Share your work using the following URL",
        html     : true,
        container: $(document.body),
        placement: 'bottom',
        content  : content
      });
      
      this.on('show.bs.popover', function() { 
         content.find('input').val(mkUrl(app));
      });
    };
    
    function mkContent(){
        var div = $("<div><input style='width: 100%' type'text'></input></div>");
        div.css({width: '300px'});
        return div;
    };
    
    function mkUrl(app){
      var url       = ""+window.top.location;
      var beginning = url.split('!')[0];
      var encoded   = app.encode();
      return beginning+'!'+encoded;
    };
    
    return $;
    
});