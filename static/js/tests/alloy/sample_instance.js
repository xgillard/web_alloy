define(function(){
   return  '<alloy>'
         + '<instance>'
         // Private sig 'ordering/Ord' aka id 13
         + '<sig label="ordering/Ord" ID="13" parentID="2" one="yes" private="yes">'
         + '    <atom label="ordering/Ord$0"/>'
         + '</sig>'
         // public sig 'Man' 
         + '<sig label="this/Man" ID="4" parentID="5">'
         + '   <atom label="Man$0"/>'
         + '   <atom label="Man$1"/>'
         + '</sig>'
         // 1 tuples 'wife'
         + '<field label="wife" ID="6" parentID="4">'
         + '   <tuple> <atom label="Man$1"/> <atom label="Woman$0"/> </tuple>'
         + '   <types> <type ID="4"/> <type ID="7"/> </types>'
         + '</field>'
        // public sig woman
         + '<sig label="this/Woman" ID="7" parentID="5">'
         + '   <atom label="Woman$0"/>'
         + '</sig>'
         // 1 tuple husband
         + '<field label="husband" ID="8" parentID="7">'
         + '   <tuple> <atom label="Woman$0"/> <atom label="Man$1"/> </tuple>'
         + '   <types> <type ID="7"/> <type ID="4"/> </types>'
         + '</field>'
         // 1 abstract sig Person
         + '<sig label="this/Person" ID="5" parentID="2" abstract="yes">'
         + '</sig>'
         
         + '<sig label="univ" ID="2" builtin="yes">'
         + '</sig>'
         // Man$1 is $p
         + '<skolem label="$p" ID="9">'
         + '   <tuple> <atom label="Man$1"/> </tuple>'
         + '   <types> <type ID="5"/> </types>'
         + '</skolem>'
         // Woman$0 is $p'
         + '<skolem label="$p&apos;" ID="10">'
         + '   <tuple> <atom label="Woman$0"/> </tuple>'
         + '   <types> <type ID="5"/> </types>'
         + '</skolem>'
         + '</instance>'
         + '</alloy>';
});

