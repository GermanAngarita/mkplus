'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const budgetWarrantySchema = new Schema({
    createUp:{ type:Date, default:new Date( Date.now() )},
    yearmonth:{ type:Number, unique:true },
    year:{ type:Number },
    month:{ type:Number },
    budget:{ type:Number }
})

module.exports = mongoose.model('budgetWarranty', budgetWarrantySchema)