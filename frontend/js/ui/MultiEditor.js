define(
  ['jquery', 'util/_', 'ui/Editor', 'AppContext'],
  function($,_, Editor){
      
      function MultiEditor(app){
        this.app      = app;
        this.tag      = mkTag();
        this.navigator= mkNavigator(this);
        // this is required to help me implement a resizable left pane that works in FF too.
        this.mousepos = {x: 0, y: 0};
        enableResizing(this);
      };
      
      MultiEditor.prototype.currentEditor = function(){
        var mod = this.app.current_module;
        return this.navigator.find("li.active")[mod]._editor;  
      };
      
      function update(self){
          self.navigator = mkNavigator(this);
      };
      
      function module_title(module){
        var exp = /module\s+([^\s]+)/;
        var ret = exp.exec(module);
        return ret.length<2 ? 'Untitled' : ret[1];
      };
      
      function mkNavigator(self){
          var $nav = $("<ul class='nav nav-pills nav-stacked'></ul>");
          
          $.each(self.app.modules, function(i, module){
             var title     = module_title(module);
             var editor    = new Editor();
             
             var link      = $("<a>"+title+"</a>");
             var nav_entry = $("<li></li>"); 
             
             link[0].onclick = function(){
                 self.app.current_module = i;
                 $nav.find("li").removeClass("active");
                 nav_entry.addClass("active");
                 self.tag.find("[data-name='editor']").html(editor.tag);
             };
             
             nav_entry[0]._editor = editor;
             $nav.append(nav_entry);
             nav_entry.append(link);
             editor.getSession().setValue(module);
          });
          
          self.tag.find("[data-name='navigator']").html($nav);
          
          var current = $nav.find("li a")[self.app.current_module];
          current.click();
          return $nav;
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