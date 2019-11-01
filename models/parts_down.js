'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PartsDownSchema = new Schema({
    it: {  type:Number},
    cod_dealer: {  type:String, required:true, maxlength:5, minlength:5},
    dealer_name: {  type:String },
    date: { type:Date},
    city: { type:String},
    month: { type:String },
    total_amount: {  type:Number},
    claim: {  type:Number},
    or: {  type:String},
    parts_ref: {  type:String},
    parts_des: {  type:String},
    amount: {  type:Number},
    date_repair: {  type:Date},
    vin: {  type:String, required:true, maxlength:17, minlength:17},
    date_approval: {  type:Number},
    witnesses: {  type:Array},
    attach:{ type:Object },
    totalAmount:{ type:Number },
    key:{ type:String } // Dealer + claim + Parts_ref + VIN
})

module.exports = mongoose.model('partsDown', PartsDownSchema)