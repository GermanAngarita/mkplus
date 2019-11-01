'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const VinRetentionSchema = new Schema({
    vin:{ type:String, unique:true },
    dealer:{ type:String },
    init_warranty:{ type:Date },
    monthsOnway:{ type:Number },
    yearsOnway:{ type:Number },
    tickets:{ type:Number },
    retention:{ type:Number, min:0, max:1 }
})

module.exports = mongoose.model('vinRetention', VinRetentionSchema)