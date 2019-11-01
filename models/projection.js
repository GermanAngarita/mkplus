'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const distributionSchema = new Schema({
    mto:{ type:String },
    media:{ type:Number },
    std_desv:{ type:Number },
    createUp:{ type:Date, default:new Date() }
})

module.exports = mongoose.model('distri', distributionSchema)