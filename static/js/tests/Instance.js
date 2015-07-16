define(['jquery','util/_', 'alloy/Instance', "tests/sample_instance" ],
function($, _, Instance, sample){
  
   function json(obj){
       return JSON.stringify(obj);
   }
   
   return {
      SuiteInfo : {
          title   : "Testing alloy/Instance module",
          setup   : _.noop,
          tearDown: _.noop
      },
      TestCases : {
        only_public_sig: function(assert){
           var instance = new Instance(sample);

           assert.equal(instance.sigs.length, 4);
           assert.equal(instance.signature('ordering/Ord')  , undefined);
           assert.equal(instance.signature('this/Person').id, '5');
           assert.equal(instance.signature('this/Man').id   , '4');
           assert.equal(instance.signature('this/Woman').id , '7');
        },
        all_atoms_retrieved: function(assert){
           var instance = new Instance(sample);

           assert.equal(json(instance.atom("Man$0")),  json({type_id: '4', label: 'Man$0'}));
           assert.equal(json(instance.atom("Man$1")),  json({type_id: '4', label: 'Man$1'}));
           assert.equal(json(instance.atom("Woman$0")),json({type_id: '7', label: 'Woman$0'}));
        },
        no_duplicate_atom: function(assert){
            var instance = new Instance(sample);

            // If men and/or woman were duped, then atoms.length > 3
            assert.equal(instance.atoms.length, 3);
        },
        all_tuples_retrieved: function(assert){
            var instance = new Instance(sample);

            assert.equal(instance.tuples.length, 2);
            var woman = instance.atom("Woman$0");
            assert.equal(
                    json(instance.linksOf(woman)),
                    json([{type_id: '8', label: 'husband', src: 'Woman$0', dst: 'Man$1'}]));
        },
        all_skolems_retrieved: function(assert){
            var instance = new Instance(sample);

            assert.equal(instance.skolems.length, 2);
        },
        atom_returns_same_instance: function(assert){
            var instance = new Instance(sample);

            var woman = instance.atom("Woman$0");
            assert.equal(woman.check, undefined);
            woman.check = true;
            woman = instance.atom("Woman$0");
            assert.equal(woman.check, true);
            woman.check = undefined;
        },
        signature_returns_same_instance: function(assert){
            var instance = new Instance(sample);

            var woman = instance.signature("this/Woman");
            assert.equal(woman.check, undefined);
            woman.check = true;
            woman = instance.signature("this/Woman");
            assert.equal(woman.check, true);
            woman.check = undefined;
        },
        sourceOf_returns_same_instance: function(assert){
            var instance = new Instance(sample);

            var tuple = _.first(instance.tuples);
            var src   = instance.sourceOf(tuple);
            assert.equal(src.check, undefined);
            src.check = true;
            src   = instance.sourceOf(tuple);
            assert.equal(src.check, true);
            src.check = undefined;
        },
        sourceOf_returnsProperVal: function(assert){
            var instance = new Instance(sample);

            var woman = instance.atom("Woman$0");
            var tuple = instance.linksOf(woman)[0];
            var ret   = instance.sourceOf(tuple);
            assert.equal(json(woman), json(ret));
        },
        targetOf_returns_same_instance: function(assert){
            var instance = new Instance(sample);

            var tuple = _.first(instance.tuples);
            var dst   = instance.targetOf(tuple);
            assert.equal(dst.check, undefined);
            dst.check = true;
            dst   = instance.targetOf(tuple);
            assert.equal(dst.check, true);
            dst.check = undefined;
        },
        targetOf_returnsProperVal: function(assert){
            var instance = new Instance(sample);

            var woman = instance.atom("Woman$0");
            var man$1 = instance.atom("Man$1");
            var tuple = instance.linksOf(woman)[0];
            assert.equal(json(man$1), json(instance.targetOf(tuple)));
        },
        signatureOf_returns_same_instance: function(assert){
           var instance = new Instance(sample);
           var woman    = instance.atom("Woman$0");
           var ret      = instance.signatureOf(woman);

           assert.ok(ret.check === undefined);
           ret.check = true;
           ret = instance.signatureOf(woman);
           assert.ok(ret.check === true);
           ret.check = undefined;
        },
        signatureOf_returnsProperVal: function(assert){
           var instance = new Instance(sample);
           var woman    = instance.atom("Woman$0");
           var sig      = instance.signature("this/Woman");
           var ret      = instance.signatureOf(woman);

           assert.equal(json(sig), json(ret));
        },
        linksOf_returnsProperVal: function(assert){
           var instance = new Instance(sample);
           var woman    = instance.atom("Woman$0");
           var ret      = instance.linksOf(woman);

           assert.equal(json([{type_id: "8", label:"husband", src: "Woman$0", dst: "Man$1"}]), json(ret));
        },
        markersOf_returnsProperVal: function(assert){
           var instance = new Instance(sample);
           var woman    = instance.atom("Woman$0");
           var ret      = instance.markersOf(woman);

           assert.equal(json(["$p'"]), json(ret));
        },
        atomsOf_returnsProperVal: function(assert){
           var instance = new Instance(sample);
           var person   = instance.signature("this/Person");
           var atoms    = instance.atomsOf(person);

           assert.equal(atoms.length, 3);
        },
        rootSignatures_returnsProperVal: function(assert){
            var instance = new Instance(sample);
            var person   = instance.signature("this/Person");
            var result   = instance.rootSignatures();
            assert.equal(json(result), json([person]));
        },
        /***/
        projected_only_keeps_non_pj_sig: function(assert){
            var instance = new Instance(sample);
            var person   = instance.signature("this/Person");

            var projected= instance.projected({'this/Person' : "Woman$0"});
            assert.equal(json(projected.sigs), json([instance.univ()]));
        },
        projected_removes_necessary_atoms: function(assert){
            var instance = new Instance(sample);
            var person   = instance.signature("this/Person");

            var projected= instance.projected({"this/Person" : "Woman$0"});
            assert.equal(json(projected.atoms), json([]));

            assert.equal(json(instance.projected({"non":"existing"})), json(instance));
        },
        projected_adds_proper_markers: function(assert){
            var instance = new Instance(sample);
            var projected= instance.projected({"this/Man" : "Man$1"});
            var woman    = projected.atom("Woman$0");
            var result   = projected.markersOf(woman);
            assert.equal(json(result), json(["$p'", "wife"]));
        }
     }
   };
});