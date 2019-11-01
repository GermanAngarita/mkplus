'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema

const ComplementaryServicesSchema = new Schema({
	create:{ type:Date, default: new Date( Date.now() )},
	service:{ type:String },
	frequency:{ type:Number },
	amount:{ type:Number },
	terms:{ type:String },
	active:{ type:Boolean, default:true },
	group:{ type:String },
	key:{ type:String, unique:true }
})

module.exports = mongoose.model('compService', ComplementaryServicesSchema)