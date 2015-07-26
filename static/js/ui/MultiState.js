define(
  ['jquery', 'util/_', 'bootstrap'],
  function($,_){
      
      /*
       * model must be of the form { Label -> Style } and there MUST BE 
       * AT LEAST ONE STYLE
       */
      function MultiState( model, callback ){
        this.labels = _.keys(model);
        this.styles = _.values(model);
        
        this.tag    = $("<button type='button' class='btn btn-default'>"+this.labels[0]+"</button >");
        this._value  = 0;
        setVal(this, this.labels[0]);
        this.tag[0].onclick = _.partial(with_setval, this, callback);
      };
      
      MultiState.prototype.val = function(){
          if(arguments.length === 0 ) {
              return getVal(this);
          }
          return setVal(this, arguments[0]);
      };
      
      function setVal(self, value){
        var x = _.indexOf(self.labels, value);
        if(self._value === x) {
            return;
        }
        self._value = x;
        _.each(self.styles, function(s){
            self.tag.removeClass(s);
        });
        self.tag.addClass(self.styles[x]);
        self.tag.text(value);
      };
      
      function getVal(self){
        return self.labels[self._value];
      };

      function with_setval(self, fn){
        var v = (self._value + 1) % self.labels.length;
        self.val(self.labels[v]);
        fn();
      };
    
      return MultiState;
  }
);