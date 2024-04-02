const Joi = require("joi");
const mongoose = require("mongoose");

let datePattern = /\d{1,2}(-|\/)\d{1,2}(-|\/)\d{4}/; 

// joi
function validateRepair(reqBody) {
    const schema = Joi.object({
        id_number: Joi.string(),
        description: Joi.string(),
        costs: Joi.array().items(Joi.object( {serviceName: String, price: Number} )),
        date: Joi.string().regex(datePattern),
        workers: Joi.array().items(Joi.string()),
        car: Joi.string(),
        publishedFrom: Joi.string(),
        // final_cost: it is automatically calculateds 
    });

    let result = schema.validate(reqBody);
    return result;
}


// mongoose
const repairSchema = new mongoose.Schema({
    // f_id: {type: Number, required: true, unique: true, min: 0} ,
    id_number: {type: String, required: true},
    description: {type: String, trim: true} ,
    costs: {
        type: [{
            serviceName: String,
            price: {type: Number, required: true},
        }]
    },
    date: {type: String, match: datePattern} ,
    workers : {type: [mongoose.Schema.ObjectId], ref: 'Worker'},
    car : {type: mongoose.Schema.ObjectId, ref: 'Car'},
    publishedFrom: {type: mongoose.Schema.ObjectId, ref: 'Branch'},
    final_cost: {type: Number, min: 0},
});

const RepairModel = mongoose.model("Repair", repairSchema);


module.exports.validateRepair = validateRepair;
module.exports.repairSchema = repairSchema;
module.exports.RepairModel = RepairModel;