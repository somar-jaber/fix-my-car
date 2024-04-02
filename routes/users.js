const asyncTryCath = require("../middlewares/asyncTryCatch");
const argon2 = require("argon2");
const {validateUser, UserModel} = require("../models/user");
const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();


// This just to post(register) a new user. The authentication is in the auth.js rout 
router.post("/", authMiddleware, asyncTryCath(async(req, res) => {
    let result = validateUser(req.body);
    if (result.error) return res.status(400).send(`400 Bad Request: ${result.error.details[0].message}`);
    
    // To check if the user is already exists
    let userSample = await UserModel
        .findOne()  // do not use find() because it returns errors use findOne()
        .or([{email: req.body.email}])
    if (userSample) return res.status(400).send(`400 Bad Request: user already registered`);

    userSample = new UserModel({
        workerId: req.body.workerId,
        name: req.body.name,
        email: req.body.email,
        password: await argon2.hash(req.body.password), // returns a hashed password
    });
    
    try {
        const token = await userSample.generateAuthToken(res);
        await userSample.save();

        return res.header("x-auth-token", token).send({
            name: userSample.name,
            email: userSample.email,
        });
    }
    catch(exception) {
        console.log(exception.message);
        return res.send(exception.message);
    }
}));


router.get("/me", authMiddleware, asyncTryCath(async(req, res) => {
    const userSample = await UserModel
        .findById(req.user._id)
        .select("-password")
        .populate({ path: "workerId", populate: {path: "branch", model: "Branch"} });  // this will populate the workerId path and the branch path inside the workerId  
    return res.send(userSample);
}));

module.exports.router = router;