'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AfterSalesReportDetails = new Schema({
    srg: { type: String, required: true },
    type: { type: String, required: false },
    name: { type: String, required: false },
    date_repair: { type: Date, required: false },
    vin: { type: String, required: false },
    model: { type: String, required: false },
    model_description: { type: String, required: false },
    type_reg: { type: String, required: false },
    code_reg: { type: String, required: false },
    name_reg: { type: String, required: false },
    amount: { type: String, required: false },
    cost_part_clr: { type: String, required: false },
    cost_part_dealer: { type: String, required: false },
    cost_part_warranty: { type: String, required: false },
    parts_dollars: { type: String, required: false },
    value_unit: { type: String, required: false },
    mo_value: { type: String, required: false },
    mo_value_requested: { type: String, required: false },
    reponsable_warranty: { type: String, required: false },
    cl: { type: String, required: false },
    warranty: { type: Number, required: false },
    key: { type: String, required: false },
    year_month_approval:{ type:Number }
}) 

AfterSalesReportDetails.pre('save', function(next){
    let doc = this;
    doc.year_month_approval = parseInt(doc.year_month_approval)
    doc.cl = doc.srg.split("-")[0];
    doc.warranty = parseInt(doc.srg.split("-")[1]) * 1;
    doc.key = doc.cl + doc.warranty + doc.vin + doc.code_reg
    next()
})

module.exports = mongoose.model('rpgDetails', AfterSalesReportDetails)