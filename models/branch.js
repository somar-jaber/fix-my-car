const Joi = require("joi");
const mongoose = require("mongoose");

// joi
function validateBranch(reqBody) {
    const schema = Joi.object({
        name: Joi.string(),
        location: Joi.string().allow(''),   //allow('') allowes the empty string. Or you can use  .empty('').default('default value')  to consider the empty string as a default value. Don't forget to use ?? insted of || in the update route to accept the falsy values as [] "" false 0 .  
    });

    let result = schema.validate(reqBody);
    return result;
}


// mongoose
const branchSchema = new mongoose.Schema({
    name: {type: String, required: true},
    location: String
});

const BranchModel = mongoose.model("Branch", branchSchema);


module.exports.branchSchema = branchSchema;
module.exports.BranchModel = BranchModel;
module.exports.validateBranch = validateBranch;