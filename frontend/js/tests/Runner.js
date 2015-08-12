define(['qunit'], function(QUnit){
    
    function Runner(Libs){
        var self = this;
        Libs.forEach(function(t){self.run(t);});
        
        QUnit.start();
    }
    
    Runner.prototype.run = function(Lib){
        var suite = Lib.SuiteInfo;
        QUnit.module(suite.title, {
            beforeEach: suite.setup,
            afterEach : suite.tearDown
        });
        
        var tests = Object.keys(Lib.TestCases);
        tests.forEach(function(test){
            QUnit.test(test, Lib.TestCases[test]);
        });
    };
    
    return Runner;
});