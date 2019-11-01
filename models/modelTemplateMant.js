'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ModelTemplateMant = new Schema({
    cl: { type:String }, 
    cod: { type:String }, 
    name: { type:String }, 
    vin: { type:Array }, 
    supply: { type:Number }, 
    mo: { type:Number }, 
    mto5: { type:Object, default:{ hour:0 } }, 
    mto10: { type:Object }, 
    mto15: { type:Object }, 
    mto20: { type:Object }, 
    mto25: { type:Object }, 
    mto30: { type:Object }, 
    mto35: { type:Object }, 
    mto40: { type:Object }, 
    mto45: { type:Object }, 
    mto50: { type:Object }, 
    key: { type:String }, 
    createUp: { type:Date }, 
    update: { type:Date },
    active:{ type:Boolean, default:true},
    edit:{ type:Boolean, default:false}
})

module.exports = mongoose.model('modelTemplateMant', ModelTemplateMant)