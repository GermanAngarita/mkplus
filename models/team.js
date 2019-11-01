'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TeamSchema = new Schema({

    name: { type:String },
    code_dealer:{ type:String },
    last_name: { type:String },
    position:{type:String},
    nid:{ type:String },
    email:{ type:String },
    mobile:{ type:String },
    telephone:{ type:String },
    reportReception:{ type:Boolean},
    surveyAlert:{ type:Boolean },
    dateIn:{ type:Date},
    profile_picture:{ type:Object, default:{url:'https://app.kia.com.co:3001/profiles/default.png', name:'default.png', type:'png'}},
    dateOut:{ type:Date},
    working_days:{type:Number},
    ddms_user:{type:String},
    upDate:{type:Date, default:Date.now()},
    createdUp:{ type:Date, default:Date.now()},
    status:{type:Boolean, default:true} //true: Activo, false: Inactivo
})

module.exports = mongoose.model('Team', TeamSchema)