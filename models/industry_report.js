'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const IndustryReportSchema = new Schema({
    dealer_cod: {type:String},
    date: {type:Number},
    mechanic: {type:Number},
    collision: {type:Number},
    mechanic_parts: {type:Number},
    collision_parts: {type:Number},
    showroom_parts: {type:Number}
})

module.exports = mongoose.model('industryReport', IndustryReportSchema)