// Note: do not forget to set up the winston in the index.js
const winston = require("winston");

module.exports = function(err, req, res, next) {
    // first argument to the logging level, the second one for the message , and the last one for the metadata.  
    winston.log("error", err.message, err);

    // the err is the exception itself that has passed to this middleware from the asyncTryCath middleware.
    return res.status(500).send(`500 something faild in the server: \n${err.message}`);
}