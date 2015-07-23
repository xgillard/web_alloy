define([], function(){
   
    var families = [
        "sans-serif", "serif", "fantasy", "monospace", "cursive"
    ]; 
   
    var sizes = [
         9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28,
        32, 36, 40, 44, 48, 54, 60, 66, 72
    ];
    
    return {
        'Families': families,
        'Sizes'   : sizes
    };
    
});