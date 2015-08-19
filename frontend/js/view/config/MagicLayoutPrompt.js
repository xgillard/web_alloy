define(
  ['jquery', 'util/_', 'bootstrap'], 
  function($, _, bs){
      
      function MagicLayoutPrompt(){
       this.tag = mkTag();   
       this.tag[0].onclick = _.partial(mkAlert, this);
      }
      
      function mkTag(){
        var $tag = $("<a><span class='glyphicon glyphicon-flash' title='Magic Layout' ></span></a>");  
        return $tag;
      };
      
      // note I havent reused view/general/_.Alert because I want to be able to control the buttons
      function mkAlert(self){
          var pop = 
                $("<div class='alert alert-dismissible alert-warning fade in' role='alert'>"+
                    "<button type='button' class='close' data-dismiss='alert'>&times;</button>"+
                    "<table style='width: 100%'>"+
                    "<tr><td colspan='2'>This will clear your original customizations. Are you sure ?</td></tr>" +
                    "<tr>"+
                    "  <td></td>"+
                    "  <td style='padding-top: 1em; text-align: right'>" + 
                    "    <button type='button' class='btn btn-default' data-name='Yes'>Yes clear them</button>"+
                    "    <button type='button' class='btn btn-primary' data-name='No' >No keep them</button>"+
                    "  </td>"+
                    "</tr>"+
                    "</table>"+
                  "</div>");
         
        pop.find("[data-name='No']")[0].onclick = function(){
            pop.alert('close');
        }; 
        
        pop.find("[data-name='Yes']")[0].onclick = function(){
           $(self).trigger("magic_layout");
           pop.alert('close');
        };
         
        $(document.body).append(pop);
        pop.alert();
      }
      
      return MagicLayoutPrompt;
  }
);