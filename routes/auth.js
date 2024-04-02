const config = require("config");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const Joi = require("joi");
const {UserModel} = require("../models/user");
const express = require("express");
const router = express.Router();


// This is for authenticating users. Registering new users in users.js rout
router.post("/", async(req, res) => {
    // custom joi
    const joiSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    let result = joiSchema.validate(req.body); 
    if (result.error) return res.status(400).send(`400 Bad Request: ${result.error.details[0].message}`);

    //to check if the user is existed
    let userSample = await UserModel.findOne({email: req.body.email}); // do not use find() because it returns errors use findOne()
    if (!userSample) return res.status(400).send(`400 Bad Request: Invalid email or password`);

    //to check if the password is correct
    const validPassword = await argon2.verify(userSample.password, req.body.password);
    if (!validPassword) return res.status(400).send(`400 Bad Request: Invalid email or password`);
    
    try {
        const token = await userSample.generateAuthToken(res);
        return res.send(token);
    }
    catch(exception) {
        return res.send(exception.message);
    }
});


module.exports.router = router