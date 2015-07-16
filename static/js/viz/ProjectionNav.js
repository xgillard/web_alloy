/*
 * This file contains the logic required to provide the 'navigation' logic
 * related to the different 'projections' 
 */
define(['jquery', "util/_"], function($, _){
    function ProjectionNav(instance, boxes_location, nav_location, callback_function){
           this.instance = instance;
           this.boxes    = boxes_location;		// selector: where to put the checkboxes
           this.nav      = nav_location;		// selector: where to put the nav blocks
           this.cb_fn    = callback_function;
           // Checked is a SET that contains all the selected projection signatures
           this.checked  = [];

           this._display();
    }

    ProjectionNav.prototype._display = function(){
      // display the possible projections
      var node      = $(this.boxes);
      var signatures= this.instance.root_signatures();
      var boxes     = this._mkCheckBoxes(signatures);

      node.empty();
      boxes.forEach(function(box){
            node.append(box);
      });

      this.callback(this, true);
    };

    ProjectionNav.prototype.callback = function(self, remember_positions){
            var projection = self._compute_projection();
            var projected  = self.instance.projected(projection);
            self.cb_fn(projected, remember_positions);
    };

    ProjectionNav.prototype._project = function(self, label, e){
      var index = self.checked.indexOf(label);
      var input = $(self.boxes).find("input[type='checkbox'][value='"+label+"']");
      if(index < 0){
        self.checked.push(label);
        $(self.nav).append(self._mkNavBlock(label));
      }
      if(index>=0 && !input.prop('checked') ){
        self.checked.splice(index, 1);
        $(self.nav).find("span[name='"+label+"']").remove();
      }
      self.callback(self, false);
    };

    ProjectionNav.prototype._mkCheckBoxes = function(signatures){
            var self = this;
            return signatures.map(function(s){
                    var label= s.label;
                    var text = "<label><input type='checkbox' value='"+label+"' /> <span>"+label+"</span>";
                    var node = $(text);
        node.on("change", _.partial(self._project, self, label));
        return node;
            });
    };

    ProjectionNav.prototype._mkOptions = function(atoms){
            return atoms.reduce(function(a, i){
                                    return a+"<option value='"+i+"'>"+i+"</option>";
                            }, "");
    };

    ProjectionNav.prototype._mkNavBlock = function(sig){
            var self    = this; 
            var atoms   = self._atoms(sig);
            var options = self._mkOptions(atoms);

            var block   = $("<span name='"+sig+"'><select name='"+sig+"' class='atom'>"+options+"</select></span>");
            var select  = block.find("select");

            select.on("change", _.partial(self.callback, self, true));

        // button : << 
        $("<button>&lt;&lt</button>").click(function(){
          var current = atoms.indexOf(select.val());
          select.val(atoms[(current-1+atoms.length) % atoms.length]); // the +atoms.length makes it wrap around
          self.callback(self, true);
        }).insertBefore(select);

        // button : >>
        $("<button>&gt;&gt</button>").click(function(){
          var current = atoms.indexOf(select.val());
          select.val(atoms[(current+1) % atoms.length]); 
          self.callback(self, true);
        }).insertAfter(select);

        return block;
    };

    ProjectionNav.prototype._atoms = function(sig){
            return this.instance
                          .atoms_of(this.instance.l_sig[sig])
                          .map(function(a){return a.label;});
    };

    // 
    ProjectionNav.prototype._compute_projection = function(){
      var self = this;
      return $(this.nav).find("select.atom").toArray()
          .reduce(function(a, i){
            var s    = self.instance.l_sig[i.name];
            a[s.id]  = i.value; 
            return a;
          }, {});
    };

    return ProjectionNav;
});