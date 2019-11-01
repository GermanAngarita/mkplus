'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoutineLogSchema = new Schema({
	createdUp:{ type:Date, default: new Date( Date.now() )},
	
})