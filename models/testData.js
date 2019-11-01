'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TestDataSchema = new Schema({
    name:{type:String},
    detail:{ type:String },
    object:{type:Object, default:{ arrayOne:[{name:1},{name:2}]}}
})

module.exports = mongoose.model('testData', TestDataSchema)