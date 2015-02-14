(function() {

// (argument: Function) => Function;
// unsafe
T.async = function(argument) {
    var async = function(callback) {
        var called = false;
        argument(function(error, result) {
            if (!called) {
                called = true;
                if (_.isFunction(callback)) callback(error, result);
            } else throw new Error('Repeated call callback unexpected!');
        });
    };
    async.__templatesAsync = true;
	async.toString = function() {
	    var _result = new Error('Asynchrony can not be converted into synchronicity!');
        T.render(async, function(error, result) {
	        if (error) throw error;
            else _result = result;
        }, {});
	    if (_.isObject(_result) && _result instanceof Error) throw _result;
	    return _result;
	};
	return async;
};

// (argument: any) => boolean;
T.isAsyncFunction = function(argument) {
    return !!argument.__templatesAsync;
};

})();