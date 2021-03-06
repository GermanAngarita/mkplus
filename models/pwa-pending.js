'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const pwaPendingSchema = new Schema({
    pwa:{ type:String },
    claim:{ type:Number },
    cl:{ type:String, minlength:5, maxlength:5, required:true },
    approval:{ type:String },
    month_approval:{ type:Number },
    pwa_cl:{ type:String },
    pwa_pro:{ type:String },
    vin:{ type:String, minlength:17, maxlength:17, required:true },
    model_code:{ type:String },
    brand:{ type:String },
    date_inspection:{ type:Date },
    order:{ type:Number },
    kilometers:{ type:Number },
    column:{ type:String },
    cause_code:{ type:String },
    cause_name:{ type:String },
    parts:{ type:Number },
    mo:{ type:Number },
    others:{ type:Number },
    parts_delivered:{ type:Number },
    pwa_cost:{ type:Number },
    refund_dealer:{ type:Number },
    customer_opinion:{ type:String },
    cause:{ type:String }, 
    recommend_repairs:{ type:String },
    responsable:{ type:String },
    others_description:{ type:String },
    work_other_t1:{ type:String },
    work_other_t1_description:{ type:String },
    issue_code:{ type:String },
    issue_description:{ type:String },
    nature_code:{ type:String },
    nature_description:{ type:String },
    pwa_code_1:{ type:String },
    pwa_code_1_description:{ type:String },
    pwa_code_2:{ type:String },
    pwa_code_2_description:{ type:String },
    parts_value_pro:{ type:Number },
    mo_value_pro:{ type:Number },
    others_value_pro:{ type:Number },
    date_approval:{ type:Date },
    date_init_warranty:{ type:Date },
    date_shipment:{ type:Date },
    date_retail:{ type:Date },
    vehicle_owner:{ type:String },
    vehicle_color:{ type:String },
    error_pwa:{ type:String },
    observations:{ type:String },
    status:{ type:String },
    date_first_send:{ type:Date },
    date_last_send:{ type:Date },
    date_back:{ type:Date },
    date_set:{ type:Date },
    hour_set:{ type:String },
    user_set:{ type:String },
    pro_set:{ type:String },
    date_set_2:{ type:Date },
    hour_set_2:{ type:String },
    user_set_2:{ type:String },
    pro_set_2:{ type:String },

})

module.exports = mongoose.model('pwa-pending', pwaPendingSchema)
