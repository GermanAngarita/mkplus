'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReferenceSchema = new Schema({
    model: { type:String },
    ref: { type:String, required:true },
    amount:{ type:Number },
    routine:{ type:Number },
    description: { type:String },
    cost: { type:Number },
    pvc: { type:Number },
    pvp: { type:Number },
    mg_pvc: { type:Number },
    mg_pvp: { type:Number },
    createup: { type:Date },
    active: { type:Boolean, default:true },
    motor: { type:String },
    aa: { type:String },
    transmission: { type:String },
    displacement: { type:String },
    edit:{ type:Boolean, default:false}
})

module.exports = mongoose.model('ref', ReferenceSchema)