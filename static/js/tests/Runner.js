define(['qunit'], function(QUnit){
    
    function Runner(Libs){
        var self = this;
        Libs.forEach(function(t){self.run(t);});
        
        QUnit.start();
    }
    
    Runner.prototype.run = function(Lib){
        var tests = Object.keys(Lib);
        tests.forEach(function(test){
            QUnit.test(test, Lib[test]);
        });
    };
    
    return Runner;
});