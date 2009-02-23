if(!this.xq) var xq = {};



//Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);       
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();



xq.$A = function(arraylike) {
	var len = arraylike.length, a = [];
	while (len--) {
		a[len] = arraylike[len];
	}
	return a;
};

if(!Function.prototype.bindAsEventListener) {
	Function.prototype.bindAsEventListener = function() {
		var m = this, arg = xq.$A(arguments), o = arg.shift();
		return function(event) {
			return m.apply(o, [event || window.event].concat(arg));
		};
	};
}



xq.Browser = {
	isTrident: navigator.appName === "Microsoft Internet Explorer",
	isWebkit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
	isGecko: navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') === -1,
	isKHTML: navigator.userAgent.indexOf('KHTML') !== -1,
	isPresto: navigator.appName === "Opera",
	
	isMac: navigator.userAgent.indexOf("Macintosh") !== -1,
	isUbuntu: navigator.userAgent.indexOf('Ubuntu') !== -1,
	isWin: navigator.userAgent.indexOf('Windows') !== -1,

	isIE: navigator.appName === "Microsoft Internet Explorer",
	isIE6: navigator.userAgent.indexOf('MSIE 6') !== -1,
	isIE7: navigator.userAgent.indexOf('MSIE 7') !== -1,
	isIE8: navigator.userAgent.indexOf('MSIE 8') !== -1,
	
	isFF: navigator.userAgent.indexOf('Firefox') !== -1,
	isFF2: navigator.userAgent.indexOf('Firefox/2') !== -1,
	isFF3: navigator.userAgent.indexOf('Firefox/3') !== -1,
	
	isSafari: navigator.userAgent.indexOf('Safari') !== -1
};



xq.HostEnvironment = Class.extend({
	init: function(iframe) {
		this.iframe = iframe;
	},
	startEditMode: function() {
		var doc = this.getDoc();
		
		doc.open();
		doc.write(this.generateCleanDocumentHtml());
		doc.close();
		
		this.turnOnDesignMode();
	},
	getDoc: function() {
		return this.iframe.contentWindow.document;
	},
	generateCleanDocmentHtml: function() {throw 'Not implemented';},
	turnOnDesignMode: function() {throw 'Not implemented';},
	attachEvent: function(element, eventName, handler) {throw 'Not implemented';},
	detachEvent: function(element, eventName, handler) {throw 'Not implemented';},
	stopEvent: function(e) {
		if(e.preventDefault) e.preventDefault();
		if(e.stopPropagation) e.stopPropagation();
		
		e.returnValue = false;
		e.cancelBubble = true;
		e.stopped = true;
	}
});

xq.HostEnvironment.getInstance = function(iframe) {
	if(xq.Browser.isIE) {
		return new xq.TridentHostEnvironment(iframe);
	} else {
		return new xq.W3HostEnvironment(iframe);
	}
}

xq.TridentHostEnvironment = xq.HostEnvironment.extend({
	generateCleanDocumentHtml: function() {
		var sb = [];
		sb.push('<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ko">');
		sb.push('<head>');
		sb.push('<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />');
		sb.push('</head>');
		sb.push('<body></body>');
		sb.push('</html>');
		return sb.join('');
	},
	turnOnDesignMode: function() {
		this.getDoc().body.contentEditable = true;
	},
	attachEvent: function(element, eventName, handler) {
		element.attachEvent('on' + eventName, handler);
		element = null;
	},
	detachEvent: function(element, eventName, handler) {
		element.detachEvent('on' + eventName, handler);
		element = null;
	}
});

xq.W3HostEnvironment = xq.HostEnvironment.extend({
	generateCleanDocumentHtml: function() {
		var sb = [];
		sb.push('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">');
		sb.push('<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ko">');
		sb.push('<head>');
		sb.push('<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />');
		sb.push('</head>');
		sb.push('<body></body>');
		sb.push('</html>');
		return sb.join('');
	},
	turnOnDesignMode: function() {
		this.getDoc().designMode = 'On';
	},
	attachEvent: function(element, eventName, handler) {
		element.addEventListener(eventName, handler, false);
		element = null;
	},
	detachEvent: function(element, eventName, handler) {
		element.removeEventListener(eventName, handler, false);
		element = null;
	}
});



xq.Editor = Class.extend({
	init: function(iframeId) {
		var iframe = document.getElementById(iframeId);
		this.hostenv = xq.HostEnvironment.getInstance(iframe);
		this.gestureInterpreter = new xq.GestureInterpreter();
	},
	
	setEditMode: function(mode) {
		if('wysiwyg' === mode) {
			this.hostenv.startEditMode();
			this.hostenv.attachEvent(this.hostenv.getDoc(), 'keydown', this.onKeypress.bindAsEventListener(this));
		} else if('source' === mode) {
			
		} else if('preview' === mode) {
			
		} else {
			throw 'Unsupported mode: [' + mode + ']';
		}
	},
	
	onKeypress: function(e) {
		var gesture = this.gestureInterpreter.interprete(e);
		this.onGesture(gesture);
	},
	
	onGesture: function(g) {
		console.log(g);
	}
});



xq.GestureInterpreter = Class.extend({
	interprete: function(event) {
		return {};
	}
});