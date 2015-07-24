define(
  ['jquery', 'util/_', 'ui/_'],
  
  function($,_, ui){
  
       function SigConfig(model){
         this.model = model;
         
         var self   = this;
         this.label     = ui.Text('label', function(){model.label(self.label.val());});
         
         this.textcolor = ui.Text('textcolor', function(){model.label(self.textcolor.val());});
         
         this.tag = mkTag(this);
       };
       
       function mkTag(self){
         var tag =
                // Header
                "<div class='page-header'>" +
                "<h1>Signature configuration</h1>"+
                "</div>" +
                // Form
                "<form class='form-horizontal' role='form'>" +
                // Label
                "  <div class='form-group'>" +
                "    <label class='control-label col-sm-2' >Label</label>" +
                "    <div class='col-sm-10' data-name='label'>"+
                "    </div>" +
                "  </div>" +
                // Text color
                "  <div class='form-group'>" +
                "    <label class='control-label col-sm-2' >Text Color</label>" +
                "    <div class='col-sm-10' data-name='textcolor'>"+
                "    </div>" +
                "  </div>" +
                "</form>";
        
        var $tag = $(tag);
        $tag.find("[data-name='label']").append(self.label);
        $tag.find("[data-name='textcolor']").append(self.textcolor);
        
        return $tag;  
       };
       
       return SigConfig;
      
});