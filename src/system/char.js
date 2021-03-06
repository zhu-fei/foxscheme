/*
 * FoxScheme.Char
 *
 * A character object containing a single Unicode character.
 */
FoxScheme.Char = function(c) {
	// guard against accidental non-instantiation
	if (! (this instanceof FoxScheme.Char)) {
		throw new FoxScheme.Bug("Improper use of FoxScheme.Char()");
	}
	this.init(c);
}
FoxScheme.Char.prototype = function() {
	var charString = [ // the first 128 characters
        "nul", "soh", "stx", "etx", "eot", "enq", "ack", "bel", "bs", "ht",
        "lf", "vt", "ff", "cr", "so", "si", "dle", "dc1", "dc2", "dc3", "dc4",
        "nak", "syn", "etb", "can", "em", "sub", "esc", "fs", "gs", "rs", "us",
        "space", "!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ", ",
        "-", ".", "/", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":",
        ";", "<", "=", ">", "?", "@", "A", "B", "C", "D", "E", "F", "G", "H",
        "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V",
        "W", "X", "Y", "Z", "[", "\\", "]", "^", "_", "`", "a", "b", "c", "d",
        "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r",
        "s", "t", "u", "v", "w", "x", "y", "z", "{", "|", "}", "~", "del"];
	return {
		init: function(c) {
            var oc = c; // keep original value for error messages
			if (typeof(c) === "string") {
                if (c.length == 1)
                    this._char = c;
                /*
                 * accept Scheme-formatted characters to simplify parser
                 */
                else if (c.length > 2 && c[0] == "#" && c[1] == "\\") {
                    var resolved = false;
                    c = c.substring(2); // cut off the #\
                    /*
                     * See if it's in our ASCII table
                     */
                    var i = charString.length;
                    while (i--) {
                        if (charString[i] == c) {
                            this._char = String.fromCharCode(i);
                            resolved = true;
                        }
                    }
                    if(!resolved) {
                        /*
                         * Attempt to parse hex char code #\xABCD
                         */
                        if(c[0] === "x") {
                            c = c.substring(1);
                            this._char = String.fromCharCode(parseInt(c, 16));
                            resolved = true;
                        }
                        else
                            throw new FoxScheme.Error("Invalid character "+oc);
                    }
                    if(!resolved)
                        throw new FoxScheme.Error("Could not understand character "+oc);
                }
                else
                    throw new FoxScheme.Error("Char() given string \"" + c + "\"");
            }
			else if (typeof(c) === "number")
                this._char = String.fromCharCode(c);
			else
                throw new FoxScheme.Error("Char() given object typed " + typeof(c));
		},
		toInteger: function(c) {
			// allow this to be used statically
			if (c !== undefined) return (new FoxScheme.Char(c)).toInteger();
			return this._char.charCodeAt(0);
		},
		toString: function() {
			var x = this.toInteger();
			if (x < 128) return "#\\" + charString[x];
			else return "#\\x" + x.toString(16);
		},
        getValue: function() {
            return this._char
        }
	};
} ();

