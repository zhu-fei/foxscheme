/*
 * FoxScheme.Pair
 *
 */

FoxScheme.Pair = function(car, cdr) {
    // guard against accidental non-instantiation
    if(!(this instanceof FoxScheme.Pair)) {
        console.log("Improper use of FoxScheme.Pair()");
        return null;
    }
    
    this._car = car;
    this._cdr = cdr;
};
FoxScheme.Pair.prototype = {
    car: function() {
        return this._car;
    },
    cdr: function() {
        return this._cdr;
    },
    toString: function() {
        /*
         * Recursively print out the list, if (pair? (cdr this))
         */
        if(this._cdr instanceof FoxScheme.Pair) {
            return "("+this._car.toString()
                +" "+this._cdr.toString().substring(1);
        }
        else if(this._cdr === FoxScheme.nil) {
            return "("+this._car.toString()+")";
        }
        else {
            return "("+this._car.toString()
                +" . "+this._cdr.toString()+")";
        }
    }
};
