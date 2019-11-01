'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AftersalesReport = new Schema({
    cl: { type: String, required: true },
    warranty: { type: String, required: false },
    type: { type: String, required: false },
    name: { type: String, required: false },
    name_dealer: { type: String, required: false },
    nit_dealer: { type: String, required: false },
    vin: { type: String, required: true },
    model: { type: String, required: false },
    model_description: { type: String, required: false },
    color: { type: String, required: false },
    date_warranty: { type: Date, required: false },
    kilometers: { type: Number, required: false },
    or: { type: String, required: false },
    date_repair: { type: Date, required: false },
    code_part: { type: String, required: false },
    name_part: { type: String, required: false },
    nature_code: { type: String, required: false },
    nature_name: { type: String, required: false },
    issue_code: { type: String, required: false },
    issue_description: { type: String, required: false },
    type_1: { type: String, required: false },
    works_others_type_1: { type: String, required: false },
    type_2: { type: String, required: false },
    works_others_type_2: { type: String, required: false },
    parts_value: { type: Number, required: false },
    mo_value: { type: Number, required: false },
    others_value: { type: Number, required: false },
    total_value: { type: Number, required: false },
    trouble_description: { type: String, required: false },
    causes: { type: String, required: false },
    solution: { type: String, required: false },
    approval_reponsable: { type: String, required: false },
    date_approval: { type: Date, required: false },
    year_month_approval: { type: Number, required: false },
    bill_number: { type: String, required: false },
    claim_number: { type: String, required: false },
    warranty_responsable: { type: String, required: false },
    parts_value_dollars: { type: Number, required: false },
    mo_value_dollars: { type: Number, required: false },
    others_value_dollars: { type: Number, required: false },
    total_value_dollars: { type: Number, required: false },
    parts_recovered_dollars: { type: String, required: false },
    mo_recovered_dollars: { type: String, required: false },
    others_recovered_dollars: { type: String, required: false },
    total_recovered_dollars: { type: String, required: false },
    hour_value_dealer: { type: Number, required: false },
    pwa_number: { type: String, required: false },
    pwa_code_1: { type: String, required: false },
    pwa_name_code_1: { type: String, required: false },
    pwa_code_2: { type: String, required: false },
    pwa_name_code_2: { type: String, required: false },
    acl: { type: String, required: false },
    local_facilities: { type: String, required: false },
    tracing: { type: String, required: false },
    key:{ type:String }
})

AftersalesReport.pre('save', function(next){
    let doc = this;
    doc.key = doc.cl + doc.warranty + doc.vin;
    next();    
})

module.exports = mongoose.model('rpg', AftersalesReport)

// rpg: Reporte Posventa Garantías