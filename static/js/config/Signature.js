define(
  ['jquery', 'util/_'],
  function($, _){
      
      var CHANGED = 'sig:changed';
      
      // Include font-family and font-size ??
      function SignatureConf(name){
          this._signame         = name;
          this._label           = 'Default'; // css: label
          
          this._textcolor       = '#FFFFFF'; // css: color
          this._textoutlinewidth= '2';       // css: text-outline-width
          this._textoutlinecolor= '#777777'; // css: text-outline-color
          
          this._shape           = 'Default'; // css: shape
          this._shapesize       = 50;        // css:
          this._backgroundcolor = 'Default'; // css: background-color
          
          this._borderstyle     = 'solid';   // css: border-style
          this._bordercolor     = '#888888'; // css: border-color
          this._borderwidth     = 0;         // css: border-width
          
          this._visible         = true;      // NO CSS PROP associated
          // hide unconnected ?
      };
      
      SignatureConf.prototype.CHANGED = CHANGED;
      
      SignatureConf.prototype.sigName = function(){
        return this._signame;
      };
      SignatureConf.prototype.label = function(){
        return _.get_or_set(this, '_label', arguments, CHANGED);  
      };
      SignatureConf.prototype.textColor = function(){
        return _.get_or_set(this, '_textcolor', arguments, CHANGED);  
      };
      SignatureConf.prototype.textOutlineWidth = function(){
        return _.get_or_set(this, '_textoutlinewidth', arguments, CHANGED);  
      };
      SignatureConf.prototype.textOutlineColor = function(){
        return _.get_or_set(this, '_textoutlinecolor', arguments, CHANGED);  
      };
      SignatureConf.prototype.shape = function(){
        return _.get_or_set(this, '_shape', arguments, CHANGED);  
      };
      SignatureConf.prototype.shapeSize = function(){
        return _.get_or_set(this, '_shapesize', arguments, CHANGED);  
      };
      SignatureConf.prototype.backgroundColor = function(){
        return _.get_or_set(this, '_backgroundcolor', arguments, CHANGED);  
      };
      SignatureConf.prototype.borderStyle = function(){
        return _.get_or_set(this, '_borderstyle', arguments, CHANGED);  
      };
      SignatureConf.prototype.borderColor = function(){
        return _.get_or_set(this, '_bordercolor', arguments, CHANGED);  
      };
      SignatureConf.prototype.borderWidth = function(){
        return _.get_or_set(this, '_borderwidth', arguments, CHANGED);  
      };
      SignatureConf.prototype.visible = function(){
        return _.get_or_set(this, '_visible', arguments, CHANGED);  
      };
      return SignatureConf;
});