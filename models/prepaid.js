'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PrepaidSchema = new Schema({
    mto: { type:Number, unique:true },
    offPartsImp: { type:Number },
    offPartsCon: { type:Number },
    offPartsTotal: { type:Number },
    hours: { type:Number },
    createUp: { type:Date },
    active: { type:Boolean, default:true }    
})

PrepaidSchema.pre('save', function(next){
    let prepaid = this;

    prepaid.offPartsTotal = prepaid.offPartsCon + prepaid.offPartsImp;
    next()
})

module.exports = mongoose.model('prepaid', PrepaidSchema)