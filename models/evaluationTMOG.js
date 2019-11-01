'use strict'

const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const EvaluationTMOGSchema = new Schema({
    dealer:{type:String},
    staff: {type:String},
    result:{type:Number},
    period:{type:Number},
    status:{type:Boolean, default:false},
    assistants: {type:Array},
    evaluation:{type:Array},
    createUp:{ type:Date, default:Date.now()},
    completed:{ type:Date }
})

module.exports = mongoose.model('evaluationTMOG', EvaluationTMOGSchema)