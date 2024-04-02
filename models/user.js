const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");
const { WorkerModel } = require("./worker");


// joi
function validateUser(reqBody) {
    const schema = Joi.object({
        workerId: Joi.string().required(),
        name: Joi.string(),
        email: Joi.string().email().required().min(11).max(255),
        password: Joi.string().min(8).required(),
    });

    let result = schema.validate(reqBody);
    return result;
}


// mongoose
const userSchema = new mongoose.Schema({
    workerId: {type: mongoose.Schema.ObjectId, ref: "Worker"},
    name: {
        type: String,
        lowercase: true,
        required: true,
        minlength: 4,
        maxlength: 30,
    } ,
    email: {
        type: String,
        required: true,
        minlength: 11,
        maxlength: 255,
        unique: true,
    } ,
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    isAdmin: {type: Boolean, default: false},
});

// methods is a key-value object has the user methods
userSchema.methods.generateAuthToken = async function(res) {  // this res parameter will be passed from the route handler
    const workerSample = await WorkerModel.findById(this.workerId).populate("branch");  // we populating branch to avoid the case if the branchId is no longer existed
    if(!workerSample) throw new Error("404 not Found: the worker Id not found");

    if (workerSample.branch == null) throw new Error("404 the branch Id for the worker is not founded");
    let payload = {
        _id: this._id,  // this refers to the user it self
        isAdmin: this.isAdmin,
        branch: workerSample.branch._id,
    }
    const token = jwt.sign(payload, config.get("jwtPrivateKey"));
    return token;
}; 

const UserModel = mongoose.model("User", userSchema);



module.exports.validateUser = validateUser;
module.exports.userSchema = userSchema;
module.exports.UserModel = UserModel;