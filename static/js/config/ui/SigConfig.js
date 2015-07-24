define(
  ['jquery', 'util/_', 'ui/_', 'config/Shapes', 'config/Borders'],
  
  function($,_, ui, Shapes, Borders){
  
       function SigConfig(model){
         this.model = model;
         
         this.label = ui.Text('label', _.partial(modify, this, 'label'));
         this.textColor = ui.Color('textcolor', _.partial(modify, this, 'textColor'));
         
         this.textOutlineWidth= ui.Number('textoutlinewidth', _.partial(modify, this, 'textOutlineWidth'));
         this.textOutlineColor= ui.Color('textoutlinecolor', _.partial(modify, this, 'textOutlineWidth'));
          
         this.shape = ui.Dropdown(def(Shapes), _.partial(modify, this, 'shape'));
         this.shapeSize = ui.Number('shapesize', _.partial(modify, this, 'shapeSize'));
         this.backgroundColor = ui.Color('backgroundColor', _.partial(modify, this, 'backgroundColor'));
          
         this.borderStyle = ui.Dropdown(Borders, _.partial(modify, this, 'borderStyle'));
         this.borderColor = ui.Color('borderColor', _.partial(modify, this, 'borderColor'));
         this.borderWidth = ui.Number('borderWidth', _.partial(modify, this, 'borderWidth'));
          
         this.visible = ui.SimpleCheckbox('Visible', _.partial(modify, this, 'visible'));
         this.tag = mkTag(this);
       };
       
       function def(options){
           return ['Default'].concat(options);
       };
       
       function modify(self, property){
           var value = self[property].val();
           self.model[property](value);
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
                // Text outline
                "  <div class='form-group'>" +
                "    <label class='control-label col-sm-2' >Text Outline</label>" +
                "    <div class='col-sm-10' data-name='textoutline'>"+
                "    </div>" +
                "  </div>" +
                // Shape
                "  <div class='form-group'>" +
                "    <label class='control-label col-sm-2' >Shape</label>" +
                "    <div class='col-sm-10' data-name='shape'>"+
                "    </div>" +
                "  </div>" +
                // Border
                "  <div class='form-group'>" +
                "    <label class='control-label col-sm-2' >Border</label>" +
                "    <div class='col-sm-10' data-name='border'>"+
                "    </div>" +
                "  </div>" +
                // Visible
                "  <div class='form-group'>" +
                "    <div class='col-sm-offset-2 col-sm-10'>" +
                "      <div class='checkbox' data-name='visible'></div>"+
                "    </div>" +
                "  </div>" +
                "</form>";
        
        var $tag = $(tag);
        $tag.find("[data-name='label']").append(self.label);
        $tag.find("[data-name='label']").append(self.textcolor);
        
        $tag.find("[data-name='textoutline']").append(self.textOutlineColor);
        $tag.find("[data-name='textoutline']").append(self.textOutlineWidth);
        
        $tag.find("[data-name='shape']").append(self.shape.tag);
        $tag.find("[data-name='shape']").append(self.shapeSize);
        $tag.find("[data-name='shape']").append(self.backgroundColor);
        
        $tag.find("[data-name='border']").append(self.borderStyle.tag);
        $tag.find("[data-name='border']").append(self.borderColor);
        $tag.find("[data-name='border']").append(self.borderWidth);
        
        $tag.find("[data-name='visible']").append(self.visible);
        return $tag;  
       };
       
       return SigConfig;
      
});