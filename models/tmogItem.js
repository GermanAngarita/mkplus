'use strict'

const mongoose = require('mongoose')
const Category = require('./tmogCategory')
const Schema = mongoose.Schema

const TMOGItem = new Schema({
    item: {type:String},
    description: {type:String},
    code: {type:String, unique:true},
    weight: {type:Number},
    category_code: {type:String},
    category_weight:{type:Number},
    version: { type:String },
    answer_options:{type:Array},
    order:{type:Number },
    id_category:{type:Schema.ObjectId, ref:Category},
    code_category:{ type:String },
    category:{ type:String },
    changeLog:{type:Array, default:[]},
    crateUp:{ type:Date, default: new Date()},

    target:{ type:Number },
    result:{ type:Number },
    fulfillment:{ type:Number, default:0 },
    seeFulfillment:{ type:Boolean, default:true }

})

module.exports = mongoose.model('tmogItem', TMOGItem)
