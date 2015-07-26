define(
  ['jquery', 'util/_', 'bootstrap'],
  function($,_){
      
      /*
       * model must be of the form { Label -> Style } and there MUST BE 
       * AT LEAST ONE STYLE
       */
      function MultiState( labels, values, styles, callback ){
        this.labels = labels;
        this.values = values;
        this.styles = styles;
        
        this.tag    = $("<button type='button' class='btn "+styles[0]+"'>"+this.labels[0]+"</button >");
        this._value  = 0;
        setVal(this, this.values[0]);
        this.tag[0].onclick = _.partial(with_setval, this, callback);
      };
      
      MultiState.prototype.val = function(){
          if(arguments.length === 0 ) {
              return getVal(this);
          }
          return setVal(this, arguments[0]);
      };
      
      function setVal(self, value){
        var x = _.indexOf(self.values, value);
        if(self._value === x) {
            return;
        }
        self._value = x;
        _.each(self.styles, function(s){
            self.tag.removeClass(s);
        });
        self.tag.addClass(self.styles[x]);
        self.tag.text(self.labels[x]);
      };
      
      function getVal(self){
        return self.values[self._value];
      };

      function with_setval(self, fn){
        var v = (self._value + 1) % self.values.length;
        self.val(self.values[v]);
        fn();
      };
    
      return MultiState;
  }
);