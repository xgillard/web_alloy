define(
  ['jquery', 'util/_', 'ui/_', 'config/SatSolvers','config/Layouts', 'config/Palettes', 'config/Fonts', 'bootstrap'], 
  function($,_, ui, Sat, Layouts, palette, fonts){
      
    function GeneralConfig(model){
        var self          = this;
        this.model        = model;
        this.solver       = ui.Dropdown(_.keys(Sat), function(value){self.model.solver(Sat[value]);});
        this.layout       = ui.Dropdown(Layouts, function(value){self.model.layout(value);});
        this.nodePalette  = ui.Dropdown(_.keys(palette), function(value){self.model.nodePalette(value);});
        this.edgePalette  = ui.Dropdown(_.keys(palette), function(value){self.model.edgePalette(value);});
        
        this.tag = mkTag(this);
        
        setVal(this, model);
    };
    
    GeneralConfig.val = function(){
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
        updateSolver(self);
        self.layout.val(self.model.layout());
        self.nodePalette.val(self.model.nodePalette());
        self.edgePalette.val(self.model.edgePalette());
    };
    
    function updateSolver(self){
        var value  = self.model.solver();
        var keys   = _.keys(Sat);
        var values = _.values(Sat);
        var idx    = _.indexOf(values, value);
        
        self.solver.val(Sat[keys[idx]]);
    };
    
    function mkTag(self){
        var tag =
                // Header
                "<div class='page-header'>" +
                "<h1>General configuration</h1>"+
                "</div>" +
                // Form
                "<form class='form-horizontal' role='form'>" +
                // SAT solver
                "  <div class='form-group'>" +
                "    <label class='control-label col-sm-2' >SAT Solver</label>" +
                "    <div class='col-sm-10' data-name='solver'>"+
                "    </div>" +
                "  </div>" +
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
                
                "</form>";
        
        var $tag = $(tag);
        $tag.find("[data-name='solver']").append(self.solver.tag);
        $tag.find("[data-name='layout']").append(self.layout.tag);
        $tag.find("[data-name='node.palette']").append(self.nodePalette.tag);
        $tag.find("[data-name='edge.palette']").append(self.edgePalette.tag);
        
        return $tag;
    };
    
    return GeneralConfig;
});