'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const srgSchema = new Schema({
    status:{ type:String },
    cl:{ type:String, minlength:5, maxlength:5, required:true },
    warranty:{ type:Number },
    claim:{ type:Number},
    approval:{ type:Number },
    vin:{ type:String, minlength:17, maxlength:17, required:true },
    order:{ type:String },
    kilometers:{ type:Number },
    repair_date:{ type:Date },
    catalog:{ type:String },
    part_code:{ type:String }, 
    part_name:{ type:String },
    acl:{ type:String },
    cause_code:{ type:String },
    description_issue:{ type:String },
    nature_code:{ type:String },
    nature_description:{ type:String },
    painting_code:{ type:String },
    painting_description:{ type:String },
    others_t1:{ type:String },
    others_t1_description:{ type:String },
    others_t2:{ type:String },    
    others_t2_description:{ type:String },
    others_values:{ type:Number },
    date_init_warranty:{ type:Date },
    date_import:{ type:Date },
    date_first_send:{ type:Date },
    date_last_send:{ type:Date },
    date_srg_back:{ type:Date },
    date_decision:{ type:Date },
    date_approval:{ type:Date },
    enterprise:{ type:Number },
    date_set:{ type:Date },
    hour_set:{ type:String },
    pro_set:{ type:String },
    user_set:{ type:String },
    date_create:{ type:Date },
    hour_create:{ type:String },
    pro_create:{ type:String },
    user_create:{ type:String },

})

module.exports = mongoose.model('srg', srgSchema )

