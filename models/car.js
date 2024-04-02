const Joi = require("joi");
const mongoose = require("mongoose");


// helper function
function phoneValidator(resolve, reject, numbers) {
    if (numbers.length == 0 || numbers == null) reject(new Error("phone is required"))
    for (index in numbers) {
        if (typeof numbers[index] !== "string") reject(new Error("the phone number should be string"));
        if (numbers[index].length != 10) reject(new Error("the phone number should be 10 digits"));
        resolve(true);
    }
}


// joi
function validateCar(reqBody) {
    const schema = Joi.object({
        // f_id: Joi.number().required().min(0),
        number: Joi.string().required().regex(/^\d{4}$|^\d{6}$/), // 'number' must be a string of length 4 or 6
        model: Joi.string().required().trim(),
        owner_phone: Joi.array().items(Joi.string().max(10).min(10)).min(1).required(),
        color: Joi.string(),
        visit_times: Joi.number(),  // also this being set by the server
        branches: Joi.array().items(Joi.string()),  // if the car gets into a new branch that branch will be pushed to the 'branches' array in the car doc. And the server will set the branch depending on the token that identify the 'users' who are using the system  
        // repairs: when a 'repair' pushed to the system the sustem will check the car field and pushes the repair id to the maintanied car document  
    });

    let result = schema.validate(reqBody);
    return result;
}


// mongoose 
const carSchema = new mongoose.Schema({
    // f_id: {type: Number, required: true, unique: true, min: 0} ,
    number: {type: String, match: /^\d{4}$|^\d{6}$/, required: true, unique: true, minlength: 4, maxlength: 6},
    model: {type: String, required: true, trim: true, lowercase: true},
    owner_phone: {
        type: Array,
        required: true,
        validate: {
            validator: function(numbers) {
                return new Promise((resolve, reject) => {
                    phoneValidator(resolve, reject, numbers)
                });
            } ,
            message: (props) => `Error from message field in validator ::${props.value}::` 
        } ,
    } ,
    color: {type: String, lowercase: true},
    visit_times: {type: Number, default: 1},
    branches: {type: [mongoose.Schema.Types.ObjectId], ref: 'Branch'},
    repairs: {type: [mongoose.Schema.Types.ObjectId], ref: 'Repair'},
});

const CarModel = mongoose.model("Car", carSchema);


module.exports.CarModel = CarModel;
module.exports.carSchema = carSchema;
module.exports.validateCar = validateCar;
module.exports.phoneValidator = phoneValidator;