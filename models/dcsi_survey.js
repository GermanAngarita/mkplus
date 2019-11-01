'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DcsiSurvey = new Schema({
    
    survey_cod:{ type:String }, // YYYYMM
    validation:{ type:String}, // survey_cod + cod_dcsi
    survey_validity_from:{ type:Date },
    survey_validity_to:{ type:Date },
    short:{ type:Boolean },
    long: {type:Boolean },
    cod_dcsi:{type:String, maxlength:5, minlength:5 },
    dcsi:{ type:String },
    class:{ type:String, enum:['Mandatory', 'Optional'] },
    order:{ type:Number},
    class_question:{ type:String },
    interviewer:{ string:String },
    max_point:{ type:Number },
    type_answer:{ type:Array },
    comments: {string:String },
})

module.exports = mongoose.model('DcsiSurvey', DcsiSurvey)