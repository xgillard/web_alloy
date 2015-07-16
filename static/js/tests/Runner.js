define(['qunit', 'jquery', 'underscore'], function(QUnit, $, _){
    
    function Runner(Libs){
        var self = this;
        Libs.forEach(function(t){self.run(t);});
        QUnit.start();
    }
    
    Runner.prototype.run = function(Lib){
        var tests = _.keys(Lib);
        tests.forEach(function(test){
            QUnit.test(test, Lib[test]);
        });
    };
    
    return Runner;
});