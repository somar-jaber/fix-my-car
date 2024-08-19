module.exports = function(routeHandlerFn) {
    // returning a standrad Express route handler  
    return async(req, res, next) => {
        try {
            // we have to await because the route handlers are async functions
            await routeHandlerFn(req, res);
        }
        catch (exception) {
            next(exception);
        }
    }
};