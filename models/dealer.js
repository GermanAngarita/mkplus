'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DealerSchema = new Schema({
    dealer_cod: { type:String, unique: true },
    group_dealer: { type: String },
    name_dealer: {type: String},
    subname_dealer: { type: String}, // Subnombre del dealer
    address: {type: String},
    telephone: {type:String },
    city: {type:String}, //Ciudad de ubicación
    coordinate: {type:String}, //Coordenadas para geolocalización
    type_dealer: {type:String}, // Clasificación o calificación del Dealer
    zone: {type: String },
    zoneC: {type: String },
    zoneG: {type: String },
    mo_cli_taller:{type:Number},
    colision:{ type:Boolean },
    express_service:{ type:Boolean },
    showroom:{ type:Boolean },
    launge:{ type:Boolean },
    active:{ type:Boolean, default:true },
    // a: { type:Number, default:0 },
    // b: { type:Number, default:0 },
    // c: { type:Number, default:0 },
    // d: { type:Number, default:0 },
    // supplies: { type:Number, default:0 },


})


module.exports = mongoose.model('Dealer', DealerSchema)