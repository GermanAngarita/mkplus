'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const serviceSurveySchema = new Schema({
    key:{ type:String, unique:true},
    host:{ type:String },
    shortLink:{ type:String },
    date:{ type:Date, default:new Date() },
    or:{ type:String },
    dealer:{ type:String, minlength:5, maxlength:5 },
    city:{ type:String },
    questions:{ type:Array },
    sendTo:{ type:Array },
    tracing:{ type:Array },
    status:{ type:String },
    dateAnswer:{ type:Date, default:''},
    answered:{ type:Boolean, default:false }
})

module.exports = mongoose.model('serviceSurvey', serviceSurveySchema)
