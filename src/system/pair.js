/*
 * FoxScheme.Pair
 *
 */

FoxScheme.Pair = function(car, cdr) {
    // guard against accidental non-instantiation
    if(!(this instanceof FoxScheme.Pair)) {
        throw new FoxScheme.Bug("Improper use of FoxScheme.Pair()");
    }
    
    this._car = car;
    this._cdr = cdr;
};
FoxScheme.Pair.prototype = {
    car: function() {
        return this._car;
    },
    setCar: function(v) {
        var r = this._car
        this._car = v
        return r
    },
    setCdr: function(v) {
        var r = this._cdr
        this._cdr = v
        return r
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
    },
    /*
     * Some utility functions for use internally by FoxScheme
     */
    isProper: function() {
        if(this._cdr == FoxScheme.nil)
            return true
        else if(this._cdr instanceof FoxScheme.Pair)
            return this._cdr.isProper()
        else
            return false
    },
    first: function() {
        return this.car()
    },
    second: function() {
        return this.cdr().car()
    },
    third: function() {
        return this.cdr().cdr().car()
    },
    fourth: function() {
        return this.cdr().cdr().cdr().car()
    },
    last: function() {
        if(this._cdr === FoxScheme.nil)
            return this._car
        else
            if(this._cdr instanceof FoxScheme.Pair)
                return this._cdr.last()
            else
                throw new FoxScheme.Bug("Can't get last of improper list", "Pair.last")
    },
    length: function() {
        var acc = 0
        var cursor = this
        while(cursor !== FoxScheme.nil) {
            acc += 1
            if(!(cursor instanceof FoxScheme.Pair)) // improper list
                throw new FoxScheme.Bug("Improper list "+this, "Pair.length()");
            cursor = cursor._cdr
        }
        return acc
    }
};
