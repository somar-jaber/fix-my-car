const {phoneValidator} = require("./car");
const Joi = require("joi");
const mongoose = require("mongoose");
const { repairSchema } = require("./repair");

/* Helper things */
let datePattern = /\d{1,2}(-|\/)\d{1,2}(-|\/)\d{4}/;

// hepler function
function calculateAge(birthdate) {
    // Convert birthdate string to a Date object
    const birthdateObj = new Date(birthdate);
    
    // Get the current date
    const currentDate = new Date();
    
    // Calculate the age
    const age = currentDate.getFullYear() - birthdateObj.getFullYear();
    
    // Adjust for birthdate later in the year
    if ( currentDate.getMonth() < birthdateObj.getMonth() ||
        (currentDate.getMonth() === birthdateObj.getMonth() &&
         currentDate.getDate() < birthdateObj.getDate()) ) {
        return age - 1;
    }
    
    return age;
}


// Joi
function validateWorker(reqBody) {
    const schema = Joi.object({
        // f_id: Joi.number().required().min(0),
        f_name: Joi.string().trim(),  // we will remove the required from here to make the user abel to send the only data that they want to update in the PUT verb insted of sending the whole informations
        l_name: Joi.string().trim(),
        birthdate: Joi.string().regex(datePattern),
        hiredate: Joi.string().regex(datePattern),
        role: Joi.string(),
        salary: Joi.number(),
        phone: Joi.array().items(Joi.string().max(10).min(10)).min(1),
        branch: Joi.string(),
        // repairs seted automaticaly by the system when a repair being bushed to the system   
    });

    let result = schema.validate(reqBody);
    return result
}


// mongoose
const workerSchema = new mongoose.Schema({
    // f_id: {type: Number, required: true, unique: true, min: 0} ,
    f_name: {type: String, required: true, trim: true, lowercase: true},
    l_name: {type: String, required: true, trim: true, lowercase: true},
    birthdate: {
        type: String, 
        required: true, 
        match: datePattern,
        validat: {
            validator: function(birthdate) {
                // checking if the date is in the correct formate DD/MM/YYYY ot DD-MM-YYYY
                if (datePattern.test(birthdate) == false) return false;
                
                // checking if the age is over 18
                if (calculateAge(birthdate) < 18) return false;

                return true;
            },
            message: (props) => `Error from message field in validte: the vlaue ${props.value} is not in a valid formate`
        }
    } ,
    hiredate: {type: String, required: true, match:datePattern},
    role: {type: String, required: true, lowercase: true},
    salary: {type: Number, required: true},
    phone: {
        type: Array, 
        validate: {
            validator: function(numbers) {
                return new Promise((resolve, reject) => {
                    phoneValidator(resolve, reject, numbers);
                })
            },
            message: (props) => `Error from message field in validator ::${props.value}::` 
        }
    } ,
    branch: {type: mongoose.Schema.Types.ObjectId, ref: "Branch"},
    repairs: {type: [mongoose.Schema.Types.ObjectId], ref: 'Repair'}, 
}); 

// to apply uniqueness on two fields together
workerSchema.index({ f_name: 1, l_name: 1 }, { unique: true });

const WorkerModel = mongoose.model("Worker", workerSchema);


module.exports.workerSchema = workerSchema;
module.exports.WorkerModel = WorkerModel;
module.exports.validateWorker = validateWorker;