define(['jquery','util/_','bootstrap'],function($,_){
    
    return {
        Alert: function(type, mesg){
            return "<div class='alert alert-dismissible alert-"+type+"' role='alert'>"+
            "<button type='button' class='close' data-dismiss='alert'>&times;</button>"+
            mesg +
            "</div>";
        }
    };
});