'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PartsSchema = new Schema({
    ref:{ type:String, unique:true },
    name:{ type:String },
    other:{ type:String },
    createUp:{ type:Date, default: new Date( Date.now() ) }
})

module.exports = mongoose.model('parts', PartsSchema)