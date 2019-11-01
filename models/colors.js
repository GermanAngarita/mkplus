'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ColorSchema = new Schema ({
    createdUp:{ type:Date, default:Date.now()},
    name:{ type:String, unique:true },
    colors:{ type:Object, default:{
        high:'#77F186',
        medium:'#F9EA2B',
        low:'#FA98AD',
        very_low:'#DF3A01'
    } }
})

module.exports = mongoose.model('colors', ColorSchema)