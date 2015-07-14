define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var AlloyHighlightRules = function() {
    var constants= (
        // this is not really a constant but it seemed a good fit to put it here
        "none|univ|iden|this"
    );

    var operators= (
        // quantifiers and multiplicities
        "all|some|set|lone|one|no|" + 
        // logical connectives
        "and|or|not|implies|else|iff|" +
        // set operators
        "in"
    );

    var symbolic_operators=(
        // logical connectives
        "&&|\\|\\||!|=>|<=>|" +
        // relational operators
        // relational operators
        "\\->|\\.|\\~|\\^|\\*|<:|:>|\\+\\+|" + 
        // set operators
        "\\+|\\-|&|" +
        // usual comparison operators
        "=<|>=|<|>|=|" +
        // declarations and comprehension
        ":|\\||" +
        // language specific
        "@|#"
    );

    var controls = (
       "fact|assert|fun|pred|run|check|let|sig"
    );

    var builtins = (
        "plus|minus|mul|div|rem|sum"
    );

    var misc     = (
        "module|exactly|private|open|as|for|but|int|seq|" +
        "enum|abstract|extends|Int|disj"
    );

    var keywordMapper = this.createKeywordMapper({
        "constant.language": constants,
        "keyword.operator" : operators,
        "keyword.control"  : controls,
        "support.function" : builtins,
        "keyword.other"    : misc
    }, "identifier");

   this.$rules = {
        "start" : [
            {
                token : "comment.line",
                regex : "//|\\-\\-",
                next  : "line_comment"
            }, {
                token : "comment.block",
                regex : "/\\*",
                next  : "block_comment"
            }, {
                token : "constant.numeric",
                regex : "\\d+"
            }, {
                token : keywordMapper, 
                regex : "[a-zA-Z_\'\"][a-zA-Z0-9\'\"]*\\b"
            }, {
                token : "keyword.operator",
                regex : symbolic_operators
            }, {
                token : "paren.lparen",
                regex : "[\\[\\(\\{]"
            }, {
                token : "paren.rparen",
                regex : "[\\]\\)\\}]"
            }, {
                token : "text",
                regex : "\\s+"
            } 
        ], 
        "line_comment" : [
            {
                token : "comment.line",
                regex : ".*",
                next  : "start"
            }
        ],
        "block_comment" : [
            {
                token : "comment.block",
                regex : "\\*/",
                next  : "start"
            }, {
                token : "comment.block",
                regex : ".*",
                next  : "block_comment"
            }
        ]
    };
};

oop.inherits(AlloyHighlightRules, TextHighlightRules);

exports.AlloyHighlightRules = AlloyHighlightRules;

});