'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompromiseSchema = new  Schema({
    date:{ type:Date },
    periodo:{type:Number },
    dealer:{ type:String},
    category:{ type:String},
    item: {type:String },
    text:{ type:String }, 
    area:{ type:String },
    user:{ type:String },
    priority:{type:String, default:'normal', enum:['normal', 'baja', 'alta']},
    status:{type:String, default:'Progress', enum:['Completed', 'Not Completed', 'Progress']},
    responsables:{ type:Array},
    createdUp:{ type:Date, default:new Date()},
    sended:{type:Array, default:[]}
})

module.exports = mongoose.model('compromise', CompromiseSchema)