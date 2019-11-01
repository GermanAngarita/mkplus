'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VariablesSchema = new Schema({
    name:{ type:String, required:true, unique:true },
    description:{ type:String },
    value:{ type:Number, required:true },
    createup: { type:Date },
    update: { type:Date },
    active: { type:Boolean, default:true }
})

module.exports = mongoose.model('variables', VariablesSchema)