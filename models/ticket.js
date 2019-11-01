// Modelo Entradas a Mantenimiento

'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TicketSchema = new Schema({
    id_user: {type: String },
    create_up: {type: Date, default: Date.now() },
    bill_date: {type: Date}, //Fecha Factura DDMMYYYY
    bill_number: {type: String}, //Numero de Factura / OT
    vin: {type: String, maxlength:17, minlength:17 }, // VIN
    plate: {type: String, maxlength:6}, // Placa
    kilometers: {type:Number}, // Kilometraje
    typeIn: {type:String}, // Tipo de Entrada
    dealer_cod: {type:String, maxlength:5}, // Código Dealer
    dealer_sales:{ type:String},
    use_type:{ type:String},
    date_init_warranty:{ type:Date },
    date_runt:{ type:Date },
    monthsOnWay:{type:Number},
    avgKmtMonth:{type:Number}
})

module.exports = mongoose.model('Ticket', TicketSchema)