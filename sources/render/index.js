(function() {

// Universal renderer.
// Ignores static native data JavaScript. Processes only the data of module.

// (data: TData, callback: TCallback, context?: TContext) => void;
T.render = function(data, callback, context) {
    if (_.isFunction(data)) {
        
        // Templates.sync
        if (T.isSyncFunction(data)) T.render(data(), callback, context);
        
        // Templates.async
        else if (T.isAsyncFunction(data)) data(function(error, result) { T.render(result, callback, context); });
        
        // Templates.Renderer
        else if (data.prototype instanceof T.Renderer) data._render(callback, context);
        
        // any function
        else callback(null, data);
    } else if (_.isObject(data)) {
        
        // > Renderer
        if (data instanceof T.Renderer) data._render(callback, context);
        
        // any object
        else {
            if (_.isArray(data)) var result = [];
            else var result = {};
            
            var keys = _.keys(data);

            var counter = 0;

            var handler = function() {
                if (counter < keys.length) {
                    T.render(data[keys[counter]], function(error, _result) {
                        if (error) callback(error);
                        else {
                            result[keys[counter]] = _result;
                            counter++;
                            handler();
                        }
                    }, context);
                } else {
                    callback(null, result);
                }
            };

            handler();
        }
    
    // any alse
    } else callback(null, data);
};

// (string: string, context: Object, callback: TCallback) => void;
T.renderContext = function(string, context, callback) {
    callback(null, _.template(string)(context));
};

// (attributes: TAttributes, callback: TCallback, context?: TContext) => void;
T.renderAttributes = function(attributes, callback, context) {
    T.render(attributes, function(error, attributes) {
        if (error) callback(error);
        else {
            var result = '';
            
            for (var key in attributes) {
                if (_.isNull(attributes[key])) result += ' '+key;
                else result += ' '+key+'="'+attributes[key]+'"';
            }
            
            callback(null, result);
        }
    }, context);
};

// (data: string, reg: RegExp) => string[][];
T.regExpSearch = function(data, reg) {
    var result = [], temp = null;
    while ((temp = reg.exec(data)) != null) {
        if (temp.index === reg.lastIndex) reg.lastIndex++;
        result.push(temp);
    }
    return result;
}

// https://www.regex101.com/r/cM5jC6/13
T._renderSelectorRegExp = (/(\[)|(\])|#([-\w\d]+)|\.([-\w\d]+)|([\w\d-]+)="(['\w\d\s-:\\\/\.\,\]\[={}<>%@#$%^&*~`]*)"|([\w\d-]+)='(["\w\d\s-:\\\/\.\,\]\[={}<>%@#$%^&*~`]*)'|([\w\d-]+)=([\w\d-:\\\/\.={}<>%@#$%^&*~`]*)|("['\w\d\s-:\\\/\.\,\]\[={}<>%@#$%^&*~`]+")|('["\w\d\s-:\\\/\.\,\]\[={}<>%@#$%^&*~`]+')|([_\w-:\\\/]+)/g);

// (attributes: TAttributes, selector: TSelector) => void;
T.renderSelector = function(attributes, selector) {
    var matchs = T.regExpSearch(selector, T._renderSelectorRegExp);
    var isAttr = false;
    _.each(matchs, function(node) {
        if (node[1]) { isAttr = true; return; } // [
        else if (node[2]) { isAttr = false; return; } // ]

        if (isAttr) {
            if (node[9]) { attributes[node[9]] = node[10]; return; } // attr=value
            if (node[7]) { attributes[node[7]] = node[8]; return; } // attr='value'
            if (node[5]) { attributes[node[5]] = node[6]; return; } // attr="value"
            if (node[13]) { attributes[node[13]] = null; return; } // [attr]
            if (node[12]) { attributes[node[12]] = null; return; } // ['attr']
            if (node[11]) { attributes[node[11]] = null; return; } // ["attr"]
        } else {
            if (node[3]) { attributes.id = node[3]; return; } // id
            if (node[4]) { attributes.class? attributes.class += ' ' + node[4] : attributes.class = node[4]; return; } // class
        }
    });
};

})();