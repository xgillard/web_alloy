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
          
         this.visible = ui.FlipFlop('Visible', 'Invisible', _.partial(modify, this, 'visible'));
         
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
                
                // Label
                "<div class='panel panel-default'>" +
                "<div class='panel-heading'>General</div>"+
                "<div class='panel-body'>"+
                "  <form role='form'>" +
                "  <div class='form-group' data-name='label'>" +
                "    <label>Label</label>" +
                "  </div>" +
                "  <div class='form-group' data-name='textcolor'>" +
                "    <label>Text Color</label>" +
                //
                
                //
                "  </div>" +
                "  <div class='form-group' data-name='visible'>" +
                //"      <div class='checkbox'>"+
                //"        <label >Visible</label>" +
                //"      </div>"+
                "  </div>" +
                "  </form>" +
                "</div>"+
                "</div>"+
                // Text outline
                "<div class='panel panel-default'>" +
                "<div class='panel-heading'>Text Outline</div>"+
                "<div class='panel-body'>"+
                "  <form role='form'>" +
                "  <div class='form-group' data-name='textoutlinecolor'>" +
                "    <label>Color</label>" +
                "  </div>" +
                "  <div class='form-group' data-name='textoutlinewidth'>" +
                "    <label>Width</label>" +
                "  </div>" +
                "  </form>"+
                "</div>"+
                "</div>"+
                // Shape
                "<div class='panel panel-default'>" +
                "<div class='panel-heading'>Shape</div>"+
                "<div class='panel-body'>"+
                "  <form role='form'>" +
                "  <div class='form-group'>" +
                "    <label>Shape</label>" +
                "    <div data-name='shape'></div>" +
                "  </div>" +
                "  <div class='form-group' data-name='shapeColor'>" +
                "    <label>Color</label>" +
                "  </div>" +
                "  <div class='form-group' data-name='shapeSize'>" +
                "    <label>Size</label>" +
                "  </div>" +
                "  </form>"+
                "</div>"+
                "</div>"+
                // Border
                "<div class='panel panel-default'>" +
                "<div class='panel-heading'>Border</div>"+
                "<div class='panel-body'>"+
                "  <form role='form'>" +
                "  <div class='form-group'>" +
                "    <label>Style</label>" +
                "    <div data-name='borderstyle'></div>" +
                "  </div>" +
                "  <div class='form-group' data-name='borderwidth'>" +
                "    <label>Width</label>" +
                "  </div>" +
                "  <div class='form-group' data-name='bordercolor'>" +
                "    <label>Color</label>" +
                "  </div>" +
                "  </form>"+
                "</div>"+
                "</div>";
        
        var $tag = $(tag);
        $tag.find("[data-name='label']").append(self.label);
        $tag.find("[data-name='textcolor']").append(self.textColor);
        $tag.find("[data-name='visible']").prepend(self.visible.tag);
        
        $tag.find("[data-name='textoutlinecolor']").append(self.textOutlineColor);
        $tag.find("[data-name='textoutlinewidth']").append(self.textOutlineWidth);
        
        $tag.find("[data-name='shape']").append(self.shape.tag);
        $tag.find("[data-name='shapeSize']").append(self.shapeSize);
        $tag.find("[data-name='shapeColor']").append(self.backgroundColor);
        
        $tag.find("[data-name='borderstyle']").append(self.borderStyle.tag);
        $tag.find("[data-name='bordercolor']").append(self.borderColor);
        $tag.find("[data-name='borderwidth']").append(self.borderWidth);
        
        
        return $tag;  
       };
       
       return SigConfig;
      
});