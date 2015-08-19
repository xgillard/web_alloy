define(['jquery'], function($){
    
    function PleaseWait(reason){
            this.reason = reason;
            this.abort  = mkAbort(this);
            this.tag    = mkTag(this);
    }

    PleaseWait.prototype.show = function(){
            $(document.body).append(this.tag);
    };

    PleaseWait.prototype.hide = function(){
            this.tag.remove();
    };

    function mkTag(self){
       var tag = "<div class='wait_overlay'>"           +
                 "     <div class='please_wait' >"      +
                 "         <b>Please wait</b><br />"    +
                 "         <span>The analyzer is processing your model</span><br />"+                  
                 "     </div>"                          +
                 "</div>";
       
       var $tag = $(tag);
       $tag.find('.please_wait').append(self.abort);
       return $tag;
    };
    
    function mkAbort(self){
      var $abort = $("<button type='button' class='btn btn-default'>Cancel</button>");
      $abort[0].onclick = function(){
          $(self).trigger("abort");
      };
      return $abort;
    };
    
    return PleaseWait;
});