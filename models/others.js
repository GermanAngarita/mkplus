'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Otros responsables de garantías

const OthersSchema = new Schema({
    name:{ type:String },
    code:{ type:String, unique:true, uppercase:true },
    description:{ type:String },
    setBudget:{ type:Boolean, default:false }
})

module.exports = mongoose.model('others', OthersSchema )