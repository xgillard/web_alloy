define(
  ['jquery', 'util/_', 'ui/Editor', 'AppContext'],
  function($,_, Editor){
      
      function MultiEditor(app){
        this.app      = app;
        this.tag      = mkTag();
        this.navigator= mkNavigator(this);
        // this is required to help me implement a resizable left pane that works in FF too.
        // credits : http://stackoverflow.com/questions/23992091/drag-and-drop-directive-no-e-clientx-or-e-clienty-on-drag-event-in-firefox
        this.mousepos = {x: 0, y: 0};
        enableResizing(this);
        
        $(app).on("changed:modules", _.partial(update, this));
      };
      
      MultiEditor.prototype.currentEditor = function(){
        var mod = this.app.current_module;
        return this.navigator.find("li.active")[mod]._editor;  
      };
      
      function update(self){
          // destroy all previously existing
          self.navigator.find("li").each(function(i, li){
              li._editor.destroy();
              $(li).find("a").off();
          });
          self.navigator = mkNavigator(self);
      };
      
      function update_titles(self){
         var entries = self.navigator.find("li > a");
         $.each(self.app.modules, function(i, module){
             var title = module_title(module);
             $(entries[i]).text(title);
         });
      };
      
      function module_title(module){
        var exp = /module\s+([^\s]+)/;
        var ret = exp.exec(module);
        return ret.length<2 ? 'Untitled' : ret[1];
      };
      
      function mkNavigator(self){
          var $nav = $("<ul class='nav nav-pills nav-stacked'></ul>");
          self.navigator = $nav;
          
          $.each(self.app.modules, function(i, module){
             var title     = module_title(module);
             var editor    = new Editor();
             
             var nav_entry = $("<li></li>"); 
             $nav.append(nav_entry);
             nav_entry[0]._editor = editor;
             
             var link = $("<a>"+title+"</a>");
             nav_entry.append(link);
             
             link[0].onclick = function(){
                activate(self, i);
             };
             
             editor.on("change", function(){
                self.app.modules[i] = editor.getSession().getValue();
             });
             editor.on("blur", _.partial(update_titles, self));
             
             editor.getSession().setValue(module);
          });
          
          self.tag.find("[data-name='navigator']").html($nav);
          
          activate(self, self.app.current_module);
          return $nav;
      };
      
      function activate(self, index){
        self.app.current_module = index;
        self.navigator.find("li").removeClass("active");
        var entry = self.navigator.find("li")[index];
        $(entry).addClass("active");
        self.tag.find("[data-name='editor']").html(entry._editor.tag);
      };
      
      function mkTag(){
          var tag = "<table style='width: 100%; height: 100%'>"  +
                    "<tr><td style='width: 15%; vertical-align: top; line-height: 100%;' data-name='navigator'></td>" +
                    "<td data-name='drag-handle' draggable='true' style='background-color: LightGray;height: 100%; width: 5px; vertical-align: middle'>"+
                    "<div style='width: 5px; height: 40px; background-color: DarkGray;' ></div>" +
                    "</td>" +
                    "<td data-name='editor' ></td></tr>" +
                    "</table>";
          
          return $(tag);
      };
      
      function enableResizing(self){
        /* This is the only way I found to get the x,y coordinates in firefox */
        $(document).on("dragover", function(e){
           self.mousepos = {x: e.originalEvent.clientX, y: e.originalEvent.clientY}; 
        });
        
        var $handle = self.tag.find("[data-name='drag-handle']");
        $handle[0].draggable = true;
        $handle[0].addEventListener('dragstart', function(e){
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData("nothing", "but firefox wants it");
        });
        $handle.on("drag", function(e){
           var x = self.mousepos.x;
           if(x===0) return; // avoid a bug in WebKit browsers (see : https://bugs.webkit.org/show_bug.cgi?id=39381)
           $("[data-name='navigator']").css('width', x);
        });
      };
      
      return MultiEditor;
  }
);