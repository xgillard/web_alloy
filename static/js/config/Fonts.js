define([], function(){
   
    var families = [
        'Georgia', 'Palatino Linotype', 'Book Antiqua',
        'Times New Roman', 'Arial', 'Helvetica', 'Arial Black',
        'Impact', 'Lucida Sans Unicode', 'Tahoma', 'Verdana',
        'Courier New', 'Lucida Console', 'initial'
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