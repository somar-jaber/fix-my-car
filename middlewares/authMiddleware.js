const jwt = require("jsonwebtoken");
const config = require("config");

function authMiddleware(req, res, next) {
    const token = req.header("x-auth-token");
    if(!token) return res.status(401).send("401 Unauthorized : Access denied. No token provided");


    try {
        // verify the webtoken and if it is valid returns the payload, if it is not it returns an error
        const decodedPayload = jwt.verify(token, config.get("jwtPrivateKey"));
        // adding the user property to the request and assinging the payload to it.
        req.user = decodedPayload; 
        // we will pass the req parameter with others(res, next) to the next middleware which it must be a route handler
        next();
    } catch(exception) {
        return res.status(400).send("400 Bad Request: Invalid token");
    }
}

module.exports.authMiddleware = authMiddleware;