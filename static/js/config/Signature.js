define(
  ['jquery', 'util/_', 'config/ConfigType'],
  function($, _, Type){
      
      var CHANGED = 'sig:changed';
      
      // Include font-family and font-size ??
      function SignatureConf(config, signature){
          var isUniv = (signature.label === 'univ');
          
          this._config          = config;  // This is my 'parent' config: it cannot be changed
          this._id              = signature.id;
          this._parendID        = signature.parentID;
          
          this._signame         = signature.label;
          
          this._label           = signature.label; // css: label
          
          this._textcolor       = '#FFFFFF'; // css: color
          this._textoutlinewidth= '2';       // css: text-outline-width
          this._textoutlinecolor= '#777777'; // css: text-outline-color
          
          this._shape           = isUniv ? Type.Automatic : Type.Inherited; // css: shape
          this._shapesize       = 50;        // css:
          this._backgroundcolor = isUniv ? Type.Automatic : Type.Inherited; // css: background-color
          
          this._borderstyle     = 'solid';   // css: border-style
          this._bordercolor     = '#888888'; // css: border-color
          this._borderwidth     = 0;         // css: border-width
          
          this._visible         = true;      // NO CSS PROP associated
          // hide unconnected ?
      };
      
      SignatureConf.prototype.CHANGED = CHANGED;
      
      SignatureConf.prototype.parentConfig = function(){
        return this._config.sigConfigOf(this._parendID);
      };
      
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
      SignatureConf.prototype.resolvedShape = function(){
        var res = this.shape();
        if (res === Type.Inherited){
            return this.parentConfig().resolvedShape();
        }
        return res;
      };
      SignatureConf.prototype.shapeSize = function(){
        return _.get_or_set(this, '_shapesize', arguments, CHANGED);  
      };
      SignatureConf.prototype.backgroundColor = function(){
        return _.get_or_set(this, '_backgroundcolor', arguments, CHANGED);  
      };
      SignatureConf.prototype.resolvedBackgroundColor = function(){
        var res = _.get_or_set(this, '_backgroundcolor', arguments, CHANGED);  
        if (res === Type.Inherited){
            return this.parentConfig().resolvedBackgroundColor();
        }
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