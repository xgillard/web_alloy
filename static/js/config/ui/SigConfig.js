define(
  ['jquery', 'util/_', 'ui/_', 'config/Shapes', 'config/Borders'],
  
  function($,_, ui, Shapes, Borders){
  
       function SigConfig(model){
         this.model = model;
         this.label = ui.Text('label', _.partial(modify, this, 'label'));
         this.textColor = ui.Color('textcolor', _.partial(modify, this, 'textColor'));
         
         this.textOutlineWidth= ui.Number('textoutlinewidth', _.partial(modify, this, 'textOutlineWidth'));
         this.textOutlineColor= ui.Color('textoutlinecolor', _.partial(modify, this, 'textOutlineWidth'));
         
         this.automaticShape = ui.FlipFlop('Automatic Shape', 'Manual Shape', _.partial(autoShape, this));
         this.automaticShapeColor= ui.FlipFlop('Automatic Color', 'Manual Color', _.partial(autoShapeColor, this));
         
         this.shape = ui.Dropdown(Shapes, _.partial(modify, this, 'shape'));
         this.shapeSize = ui.Number('shapesize', _.partial(modify, this, 'shapeSize'));
         this.backgroundColor = ui.Color('backgroundColor', _.partial(modify, this, 'backgroundColor'));
          
         this.borderStyle = ui.Dropdown(Borders, _.partial(modify, this, 'borderStyle'));
         this.borderColor = ui.Color('borderColor', _.partial(modify, this, 'borderColor'));
         this.borderWidth = ui.Number('borderWidth', _.partial(modify, this, 'borderWidth'));
          
         this.visible = ui.FlipFlop('Visible', 'Invisible', _.partial(modify, this, 'visible'));
         
         this.visible.tag.css({width: '9em'});
         this.automaticShape.tag.css({width: '15em'});
         this.automaticShapeColor.tag.css({width: '15em'});
         
         this.tag = mkTag(this);
         update(this);
         // Need I react on model change ? Not even sure ...
         $(model).on(model.CHANGED, _.partial(update, this));
       };
       
       function update(self){
         var mdl = self.model;
         
         self.label.val(mdl.label());
         self.textColor.val(mdl.textColor());
         
         self.textOutlineWidth.val(mdl.textOutlineWidth());
         self.textOutlineColor.val(mdl.textOutlineColor());
         
         if(mdl.shape() === 'Default'){
             self.automaticShape.val(true);
             self.shape.button.attr("disabled", true);
         } else {
             self.automaticShape.val(false);
             self.shape.button.attr("disabled", false);
             self.shape.val(mdl.shape());
         }
         if(mdl.backgroundColor() === 'Default'){
             self.automaticShapeColor.val(true);
             self.backgroundColor.attr("disabled", true); 
         } else {
             self.automaticShapeColor.val(false);
             self.backgroundColor.attr("disabled", false); 
             self.backgroundColor.val(mdl.backgroundColor());
         }
         
         self.shapeSize.val(mdl.shapeSize());
         
         self.borderStyle.val(mdl.borderStyle());
         self.borderColor.val(mdl.borderColor());
         self.borderWidth.val(mdl.borderWidth());
       };
       
       function autoShape(self){
           if(self.automaticShape.val()) {
               self.model.shape('Default');
               self.shape.button.attr("disabled", true); 
           } else {
               self.model.shape(self.shape.val());
               self.shape.button.attr("disabled", false); 
           }
       };
       
       function autoShapeColor(self){
           if(self.automaticShapeColor.val()) {
               self.model.backgroundColor('Default');
               self.backgroundColor.attr("disabled", true); 
           } else {
               self.model.backgroundColor(self.backgroundColor.val());
               self.backgroundColor.attr("disabled", false); 
           }
       };
       
       function modify(self, property){
           var value = self[property].val();
           self.model[property](value);
       };
       
       function mkTag(self){
         var tag =
                // Header
                "<div class='page-header' data-name='title'>" +
                "<h1>"+self.model.sigName()+"<small>&nbsp; Configuration</small></h1>"+
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
                "  </div>" +
                "  <div class='form-group' data-name='visible'>" +
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
                "    <div data-name='autoshape' class='btn-group'></div>" +
                "  </div>" +
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
        
        $tag.find("[data-name='autoshape']").append(self.automaticShape.tag);
        $tag.find("[data-name='autoshape']").append(self.automaticShapeColor.tag);
        
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