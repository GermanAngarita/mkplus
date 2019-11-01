'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TMOGCategory = new Schema({
    weight: { type:Number, min:0, max:1 },
    code: { type:String, minlength:5, maxlength:5},
    category: {type:String},
    description: { type:String },
    version: { type:String },
    order:{ type:Number},
    newItem:{type:Object},  
    createUp:{ type:Date, default: new Date()}
})

module.exports = mongoose.model('tmogCategory', TMOGCategory)