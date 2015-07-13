function LayoutPicker(id, callback){
	var self     = this;
	self.instance= null;
	self.select   = $("<select id='"+id+"'></select>");

	InstanceVisualizer.prototype.LAYOUTS.forEach(function(l){
    	self.select.append("<option value='"+l+"'>"+l+"</option>");
  	});

	self.select.on("change", function(){
		if(self.instance!=null){
			callback(self.instance);
		}
	});
}