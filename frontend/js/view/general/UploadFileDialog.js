define(['jquery', 'util/_', 'base64','bootstrap'], function($, _, Base64){
    
    function UploadFileDialog(){
        this.tag   = $("<a><span class='glyphicon glyphicon-cloud-upload' title='Upload'></span></a>");
        
        this.input = $("<input type='file' />");
        
        var self = this;
        this.tag.popover({
          title    : "Upload your work from a previous version",
          html     : true,
          container: $(document.body),
          placement: 'bottom',
          content  : mkContent(self)
        });
        
        this.input[0].onchange = function(e){
          var file   = e.target.files[0];
          var reader = new FileReader();
          
          reader.onload = function(read_evt){
              $(self).trigger("changed", read_evt.target.result);  
              self.tag.popover('hide');
          };
          
          reader.readAsText(file);
        };
    }

    function mkContent(self){
        var $content = $("<div style='width: 300px'></div>");
        $content.append(self.input);
        return $content;
    };
    
    return UploadFileDialog;
    
});