define(
  ['jquery', 'util/_', 'ui/_', 'config/Layouts', 'config/Palettes', 'config/Fonts', 'bootstrap'], 
  function($,_, ui, Layouts, palette, fonts){
      
    function GraphConfig(model){
        var self          = this;
        this.model        = model;
        this.layout       = ui.Dropdown(Layouts, function(value){self.model.layout(value);});
        this.nodePalette  = ui.Dropdown(_.keys(palette), function(value){self.model.nodePalette(value);});
        this.edgePalette  = ui.Dropdown(_.keys(palette), function(value){self.model.edgePalette(value);});
        
        this.fontFamily   = ui.Dropdown(fonts.Families, function(value){self.model.fontFamily(value);});
        this.fontSize     = ui.Dropdown(fonts.Sizes, function(value){self.model.fontSize(value);});
        
        this.tag = mkTag(this);
        setVal(this, model);
    };
    
    GraphConfig.val = function(){
        if(arguments.length === 0){
            return mkVal(this);
        }
        setVal(arguments[0]);
    };
    
    function getVal(self){
        return self.model;
    };
    
    function setVal(self, value){
        // reset event handling
        $(self.model).off(self.model.CHANGED);
        self.model = value;
        $(self.model).on(self.model.CHANGED, _.partial(update, self));
    };
    
    function update(self, value){
        self.layout.val(self.model.layout());
        self.nodePalette.val(self.model.nodePalette());
        self.edgePalette.val(self.model.edgePalette());
        self.fontFamily.val(self.model.fontFamily());
        self.fontSize.val(self.model.fontSize());
    };
    
    function with_my_val(fn, self){
        return fn(getVal(self));
    };
    
    function checkbox(name, callback){
        var $chk = $("<input type='checkbox' name='"+name+"' />");
        $chk.on("changed", function(){callback($chk.prop('changed'));});
        return $chk;
    };
    function button(label, callback){
        var $btn = $("<button type='button' class='btn btn-primary'>"+label+"</button>");
        $btn[0].onclick = callback;
        return $btn;
    };
    function mkTag(self){
        var tag =
                // Header
                "<div class='page-header'>" +
                "<h1>Graph configuration</h1>"+
                "</div>" +
                // Form
                "<form class='form-horizontal' role='form'>" +
                // Overall layout
                "  <div class='form-group'>" +
                "    <label class='control-label col-sm-2' >Layout</label>" +
                "    <div class='col-sm-10' data-name='layout'>"+
                "    </div>" +
                "  </div>" +
                // Node palette
                "  <div class='form-group'>" +
                "    <label class='control-label col-sm-2' >Node Palette</label>" +
                "    <div class='col-sm-10' data-name='node.palette'>"+
                "    </div>" +
                "  </div>" +
                // Edge palette
                "  <div class='form-group'>" +
                "    <label class='control-label col-sm-2' >Edge Palette</label>" +
                "    <div class='col-sm-10' data-name='edge.palette'>"+
                "    </div>" +
                "  </div>" +
                // Font
                "  <div class='form-group'>" +
                "    <label class='control-label col-sm-2' >Font</label>" +
                "    <div class='col-sm-10' data-name='font'>"+
                "    </div>" +
                "  </div>" +
                
                "</form>";
        
        var $tag = $(tag);
        $tag.find("[data-name='layout']").append(self.layout.tag);
        $tag.find("[data-name='node.palette']").append(self.nodePalette.tag);
        $tag.find("[data-name='edge.palette']").append(self.edgePalette.tag);
        $tag.find("[data-name='font']").append(self.fontFamily.tag);
        $tag.find("[data-name='font']").append(self.fontSize.tag);
        
        return $tag;
    };
    
    return GraphConfig;
});