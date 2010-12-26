/*
 * FoxScheme.Interpreter
 *
 * A simple interpreter of Scheme objects, passed in as FoxScheme objects.
 * This interpreter optionally needs the native functions as provided
 * by the src/native/*.js files.
 *
 * Example usage:
 * 
 *     var p = new FoxScheme.Parser("(+ 2 2)")
 *     var i = new FoxScheme.Interpreter();
 *     while((var expr = p.nextObject()) != p.EOS)
 *         print(i.eval(expr))
 */
FoxScheme.Interpreter = function() {
    if(!(this instanceof FoxScheme.Interpreter)) {
        throw FoxScheme.Error("Improper use of FoxScheme.Interpreter()")
        return null
    }

    this.initialize();
}

FoxScheme.Interpreter.prototype = function() {
  var initialize = function () {
    this._globals = new FoxScheme.Hash();
  }
  /*
   * Arrayify can convert both FoxScheme lists
   * and arguments "arrays" into arrays
   */
  var arrayify = function(list) {
    var ls = []
    /*
     * Converts a FoxScheme list into an array by
     * walking the list
     */
    if(list instanceof FoxScheme.Pair ||
       list === FoxScheme.nil) {
      while(list instanceof FoxScheme.Pair) {
        ls.push(list.car())
        list = list.cdr()
      }
      /*
       * Check if last item is improper (not nil)
       * This means that '(1 2 . 3) => [1, 2, 3] !!
       * Careful!
       */
      if(!(list === FoxScheme.nil))
        ls.push(list)
    }
    /*
     * Converts arguments into an array
     */
    else {
      var i = ls.length
      while(i--)
        ls[i] = ls[i]
    }
    return ls;
  }

  /*
   * Listify converts an array into a FoxScheme list
   */
  listify = function(arg, end) {
    /*
     * "end" allows us to override what goes at the
     * end of the list (the empty list by default)
     */
    var list = end;
    if(!end)
      list = FoxScheme.nil;
    /*
     * Build a list out of an Array
     */
    if(arg instanceof Array || arg.length) {
      var i = arg.length;
      while(i--) {
        list = new FoxScheme.Pair(arg[i], list);
      }
    }
    else
      list = new FoxScheme.Pair(arg, list);
 
    return list;
  }


  /*
   * Checks if an array contains an item by doing
   * simple for loop through the keys
   */
  var contains = function(arr, item) {
    for (i in arr)
      if(arr[i] === item)
        return true

    return false
  }

  // some reserved keywords that would throw an "invalid syntax"
  // error rather than an "unbound variable" error
  var syntax = ["lambda", "if", "let", "set!", "call/cc", "quote"]

  /*
   * eval makes up most of the interpreter.  It is a simple cased
   * recursive interpreter like the 311 interpreter.
   *
   * Currently, it doesn't support lambdas or macros or continuations
   * 
   * This section is especially indented 2 spaces or else it gets
   * kind of wide
   */
  var eval = function(expr, env) {
    /*
     * Anything besides symbols and pairs:
     * Can be returned immediately, regardless of the env
     */
    if(!(expr instanceof FoxScheme.Symbol) &&
       !(expr instanceof FoxScheme.Pair))
      return expr

    if(env === undefined)
      var env = new FoxScheme.Hash();
    
    /*
     * Symbol:
     * Look up the symbol first in the env, then in the
     * globals, and finally the system globals
     */
    if(expr instanceof FoxScheme.Symbol) {
        var sym = expr.name()
        var val
        if((val = env.get(sym)) === undefined)
          if((val = globals.get(sym)) === undefined)
            if((val = FoxScheme.nativeprocedures.get(sym)) === undefined)
              if(contains(syntax, sym))
                throw new FoxScheme.Error("Invalid syntax "+sym)
              else
                throw new FoxScheme.Error("Unbound symbol "+expr)

        return val;
    }

    /*
     * List:
     * Eval the first item and make sure it's a procedure.  Then,
     * apply it to the rest of the list.
     */
    if(expr instanceof FoxScheme.Pair) {
      if(!expr.isProper())
        throw new FoxScheme.Error("Invalid syntax--improper list: "+expr);

      /*
       * Go to the switch only if the first item is syntax
       */
      if(expr.car() instanceof FoxScheme.Symbol &&
         contains(syntax, expr.car().name())) {
        var sym = expr.first().name();
        switch (sym) {
          case "quote":
            if(expr.length() !== 2)
              throw new FoxScheme.Error("Can't quote more than 1 thing: "+expr)

            return expr.second()
            break;
          case "lambda":
            if(expr.length() < 3)
              throw new FoxScheme.Error("Invalid syntax: "+expr)

            var body = expr.third()
            var params = expr.second()
            if(params instanceof FoxScheme.Symbol) {
              var newenv = env.clone()
              var sym = expr.second().name()
              /* 
               * Catches the special case of (lambda x body)
               */
              return new FoxScheme.InterpretedProcedure(
                function() {
                  newenv.set(sym, listify(arguments))
                  return eval(body, newenv)
                },
                0,     // minimum number of args
                true); // yes, improper parameters list
            }
            else if(params instanceof FoxScheme.Pair) {
              // (lambda (a b c) body)
              if(params.isProper()) {
                params = listify(params)
                var newenv = env.clone()
                return new FoxScheme.InterpretedProcedure(
                  function() {
                    var i = params.length
                    while(i--) {
                      if(!(params instanceof FoxScheme.Symbol))
                        throw new FoxScheme.Error("Non-symbol in parameters list: "+expr)
                      newenv.set(params[i].name(), arguments[i])
                    }
                    eval(body, newenv)
                  },
                  params.length,
                  false);
              }
              // (lambda (a b . c) body)
              else {
                throw new FoxScheme.Bug("Improper parameter list not supported")
              }
            }
            else if(params === FoxScheme.nil) {
              return new FoxScheme.InterpretedProcedure(
                function() {
                  eval(body, env)
                }, 0, false);
            }
            else {
              throw new FoxScheme.Error("Invalid parameter list in "+expr)
            }
            break;
          case "begin":
            //TODO
            break;
          case "if":
            //TODO
            break;
          case "let":
            //TODO
            break;
          case "set!":
            //TODO
            break;
          case "call/cc":
            //TODO
            break;
          case "if":
            //TODO
            break;
          default:
            // this will only happen if a keyword is in the syntax list
            // but there is no case for it
            throw new FoxScheme.Bug("Unknown syntax "+sym, "Interpreter")
            break;
        }
      }
      // means that first item is not syntax
      else {
        var proc = eval(expr.car(), env)
        if(!(proc instanceof FoxScheme.Procedure))
          throw new FoxScheme.Error("Attempt to apply non-procedure "+proc)

        // something like (map eval (cdr expr))
        var args = arrayify(expr.cdr())
        for(var i in args) {
          args[i] = eval(args[i], env)
        }

        // actually do (apply (car expr) (cdr expr))
        return proc.fapply(args)
      }
    }
    throw new FoxScheme.Bug("Don't know what to do with "+expr, "Interpreter")
  }

  /*
   * Finally, give an object for FoxScheme.Interpreter.prototype
   */
  return {
    initialize: initialize,
    eval: eval
  }
}();
