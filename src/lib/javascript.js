/*
 *
 * Implements the important native JS functions for FoxScheme
 * (i.e. things that cannot be written in Scheme)
 */
/* for compatibility with dependency grapher:
var FoxScheme.lib.JavaScript = function() {
*/
(function(defun) {

//
// js:eval
// -------
//
// js:eval simply uses JavaScript's `eval` function to evaluate the given
// text. It expects to receive a FoxScheme.String as its input.
//
// The result of js:eval should be the result of the JavaScript eval, which is
// usually the last expression in the eval'd code. For example,
//
//     (js:eval "2+2;4+4") => 8
//
// Notice that if the result of evaluating the code is `undefined`,
// FoxScheme.nothing (i.e. `#<void>`) is returned instead.
//
defun("js:eval", 1, 1,
    function() {
        var expr = arguments[0];
        if(!(expr instanceof FoxScheme.String))
            throw new FoxScheme.Error("Tried to evaluate non-string: "+expr,
                "js:eval")

        // Use JavaScript's `eval` to run the given string
        var retval = eval(expr.getValue())
        if(retval === undefined)
            retval = FoxScheme.nothing

        return retval
    })

//
// js:procedure
// ------------
//
// js:procedure creates a FoxScheme procedure from a JavaScript procedure.
// Essentially, the JavaScript procedure is wrapped in FoxScheme code that
// allows it to be used as a regular Scheme procedure would be.
// 
// To use it, simply pass js:procedure a string that represents normal
// JavaScript code:
//
//     ((js:procedure "function (a, b) { return Math.sqrt(a*a + b*b) }") 3 4)
//     => 5
//
// There is no lexical scope between the JavaScript code and FoxScheme code;
// variables share two different namespaces, and consequently, the following
// won't work:
//
//     (let ((x 3))
//       ((js:procedure "function (y) { return x * y; }')))
//     => ReferenceError: x is not defined (varies by JS implementation)
//
// Please remember that you must account for FoxScheme data types when passing
// data back and forth. You must, for example, convert a JS string to a
// FoxScheme.String before you return it, as all strings in FoxScheme are of
// type FoxScheme.String. Likewise, any string that is passed in from FoxScheme
// is a FoxScheme.String and must be converted to use it like JavaScript. This
// may change in the future.
//
defun("js:procedure", 1, 1,
    function() {
        var expr = arguments[0];
        if(!(expr instanceof FoxScheme.String))
            throw new FoxScheme.Error("Tried to evaluate non-string: "+expr,
                "js:procedure")

        var proc = eval("("+expr.getValue()+")")

        if(!(proc instanceof Function))
            throw new FoxScheme.Error("JavaScript code block did not evaluate to a Function", "js:procedure")

        return new FoxScheme.JavaScriptProcedure(proc)
    })

})(FoxScheme.nativeprocedures.defun);

FoxScheme.JavaScriptProcedure = function() {
    if(!(this instanceof FoxScheme.JavaScriptProcedure)) {
        throw new FoxScheme.Bug("Improper use of FoxScheme.JavaScriptProcedure()")
    }

    this.initialize.apply(this, arguments)
}

FoxScheme.JavaScriptProcedure.prototype = (function() {

    var constructor = new FoxScheme.Procedure();

    constructor.initialize = function(proc) {
        this.proc = proc
    }

    constructor.fapply = function(interp, ls) {
        var i = ls.length
        /*
        // Do some conversions between FoxScheme and JS data types
        while(i--) {
            if(ls[i] instanceof FoxScheme.String) {
                ls[i] = ls[i].getValue()
            } else if(ls[i] === FoxScheme.nil) {
                ls[i] = null
            } else if(ls[i] === FoxScheme.nothing) {
                ls[i] = undefined
            } else if(ls[i] instanceof FoxScheme.Char) {
                ls[i] = ls[i].getValue()
            }
        }
        */
        var retval = this.proc.apply(interp, ls)
        if(retval === undefined)
            return FoxScheme.nothing

        return retval
    }

    return constructor
})();

FoxScheme.JavaScriptProcedure.prototype.toString = function() {
    return "#<JavaScriptProcedure>"
}
