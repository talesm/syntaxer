requirejs.onError = function (err) {
    /* 
        err has the same info as the errback callback:
        err.requireType & err.requireModules
    */
    console.error(err);
    // Be sure to rethrow if you don't want to
    // blindly swallow exceptions here!!!
};
require(['syntaxUi', 'exportUi', 'templates', 'semantics', 'text!model.syntax'], 
function (syntaxUi,   exportUi,   templates ,  semantics,   modelSyntax) {
    'use strict'
    //Dirt trick
    $('#input').val($('#input').val()||modelSyntax);
    $('.jAdd').click();
});