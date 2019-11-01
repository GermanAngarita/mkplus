'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TMOGSchema = new Schema({
    user:{ type:String },
    dealer:{ type:String, minlength:5, maxlength:5},
    date:{ type:Number },
    code:{ type:String },
    version:{ type:String},
    weight:{ type:Number },
    item:{ type:String },
    description: { type:String },
    code_category:{ type:String },
    order: { type:Number },
    answer:{ type:Number },
    id:{ type:String },
    comment:{ type:Array },
    files:{ type:Array },
    answer_options:{ type:Array },
    createdUp: { type:Date, default: new Date() },
    changeLog:{ type:Array }
})

module.exports = mongoose.model('tmog', TMOGSchema)