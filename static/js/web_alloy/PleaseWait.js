define(['jquery'], function($){
    
    function PleaseWait(reason){
            this.reason = reason;
            this.tag    = $( this._tag() );
    }

    PleaseWait.prototype.show = function(){
            $("body").append(this.tag);
    };

    PleaseWait.prototype.hide = function(){
            this.tag.remove();
    };

    PleaseWait.prototype._tag = function(){
            return "<div class='wait_overlay'>"           +
                   "     <div class='please_wait' >"      +
                   "         <b>Please wait</b><br />"    +
                   "         <span>"+this.reason+"</span>"+
                   "     </div>"                          +
                   "</div>";
    };
    
    return PleaseWait;
});