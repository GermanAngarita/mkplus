'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CardRequisitonSchema = new Schem({
	vin:{ type: String, unique:true },
	line:{ type:String },
	package:{ type:String },
	name:{	type:String },
	lastName:{ type:String },
	deliveryAddress:{ type:String },
	deliveryCity:{ type:String },
	deliveryDealer:{ type:String },
	deliveryGroup:{ type:String }
})

