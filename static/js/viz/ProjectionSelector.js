define(
  ['jquery', 'util/_', 'viz/SigSelector', 'viz/AtomNav', 'bootstrap'], 
  function($,_,SigSelector,AtomNav){
    
    function ProjectionSelector(instance, callback){
        var self = this;
        this.instance   = instance;
        this.callback   = _.partial(call_with_my_val, this, callback);
                
        this.tag        = $(mkTag());
        this.container  = $(mkContainer());
        this.tag.append(this.container);

        this.atomNavs   = {};
        this.sigSelector= new SigSelector(
                                _.pluck(instance.rootSignatures(), 'label'), 
                                _.partial(navigateAtoms, self));
        
        this.projButton = $(mkButton())[0];
        this.container.append(this.projButton);

        this.projButton.onclick = function(){
           mkModal('Projection', self.sigSelector.tag).modal();
       };
    };
    
    ProjectionSelector.prototype.appendTo = function(target){
      return this.tag.appendTo(target);  
    };
    
    ProjectionSelector.prototype.remove = function(){
      this.tag.remove();  
    };
    
    ProjectionSelector.prototype.val = function(){
       var self = this;
       
       function get(){
            var defined = definedNavs(self);
            return _.reduce(defined, function(a, s){
                a[s] = self.atomNavs[s].val();
                return a;
            }, {});
       };
       
       function set(projection){
           var sig_names     = _.pluck(self.instance.sigs, 'label');
           var uninitialized = _.difference(sig_names, _.keys(projection));
           
           var zero          = _.reduce(uninitialized, function(a, s){
               a[s] = false;
               return a;
           }, {});
           
           var selection    = _.reduce(_.keys(projection), function(a, s){
               a[s] = true;
               return a;
           }, zero);
           
           self.sigSelector.val(selection);
           // navigateAtoms(self, selection); // automatically triggered
           _.each(_.keys(projection), function(k){
              var nav = self.atomNavs[k];
              if(nav === undefined) return;
              nav.val(projection[k]);
           });
           // self.callback(); // automatically triggered
       };
       
       var fn = arguments.length === 0 ? get : set;
       return fn.apply(this, arguments);
    };
    
    function mkTag(){
        return "<div class='projection_selector navbar navbar-default navbar-fixed-bottom'></div>";
    };
    function mkContainer(){
        return "<div class='container'></div>";
    };
    function mkButton(){
        return "<button type='button' data-toggle='popover' class='btn btn-primary navbar-btn'>Projection</button>";
    };
    
    function mkModal(title, content){
        var mod = $(
               "<div class='modal fade in' >" +
               "<div class='modal-dialog'>"+
               "<div class='modal-content'>"+
               "<div class='modal-header'>"+
               "<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>"+
               "<h4 class='modal-title'>"+title+"</h4>"+
               "</div>"+
               "<div class='modal-body'>"+
               "<p></p>" +
               "</div>"+
               "</div><!-- /.modal-content -->"+
               "</div><!-- /.modal-dialog -->" +
               "</div>"
               );
       mod.find(".modal-body > p").append(content);
       mod.on("hidden.bs.modal", function(){mod.remove();});  
       return mod;
    };
    
    function navigateAtoms(self, selection){
        var selected  = selectedSigs(selection);
        var defined   = definedNavs(self);
        
        // remove everything that is unselected
        var suppressed = _.difference(defined, selected);
        _.each(suppressed, function(s){
           var nav = self.atomNavs[s];
           if(nav === undefined ) return;
           nav.remove();
           self.atomNavs[s] = undefined;
        });
        
        // add everythin that has been selected
        var added      = _.difference(selected, defined);
        _.each(added, function(s){
           var sig  = self.instance.signature(s);
           var atoms= _.pluck(self.instance.atomsOf(sig), 'label');
           var nav  = new AtomNav(s, atoms, self.callback);
           self.atomNavs[s] = nav;
           nav.appendTo(self.container);
        });
        
        // if there was a modification, we want to make sure the listener is 
        // made aware of that
        if(! _.isEmpty(_.union(added, suppressed)) ){
            self.callback();
        }
    };
    
    function definedNavs(self){
        return _.filter(_.keys(self.atomNavs), function(k){
            return self.atomNavs[k]!==undefined;
        });
    };
    
    function selectedSigs(selection){
        return _.filter(_.keys(selection), function(s){
            return selection[s];
        });
    };
    
    function call_with_my_val(self, fn){
        return fn(self.val());
    };
    
    return ProjectionSelector;
});