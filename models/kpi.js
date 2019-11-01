'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const KpiSchema = new Schema({
    code:{ type:String, unique:true },
    name:{ type:String},
    computed:{ type:String},
    description:{type:String},
    high:{ type:Object, default:{value:0.95}},
    medium:{type:Object, default:{value:0.90}},
    low:{ type:Object, default:{value:0}},
    very_low:{ type:Object, default:{value:0}}
})

module.exports = mongoose.model('kpi', KpiSchema)