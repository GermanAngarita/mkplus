// Base Maestra Vin's
'use strict'


const mongoose = require('mongoose')
const Schema = mongoose.Schema

const VinSchema = new Schema({

    createUp: { type: Date, default: Date.now() },
    upDate: { type: Date, default: Date.now()},
    
    enterprise: {type: Number }, //Validar la empresa
    transaction: { type: Number }, //Codigo id factura
    department: {type: Number }, //Departamento Centro de costo
    bill: { type: Number }, //Numero de la factura
    
    location: { type:String }, // Correspondencia del vehìculo es decir donde está asignado de quien es el vehìculo
    ubication: { type:String }, //Ubicación fisica del vehìculo

    bill_date: {type: Date }, //Fecha de facturación

    article: { type: String, default:'NO DATA' }, // Articulo
    article_description: { type:String},  //Descripción Articulo

    cod_model: { type: String, default:'NO DATA' }, //Cod modelo comercial
    model_description: { type: String }, //Descripcion codigo modelo
    model:{ type:String},
    model_alt:{ type:String},

    origin: { type: String }, //
    vin: { type: String, unique:true, maxlength:17 },

    engine: { type: String },
    id:{ type:String, minlength:6, maxlength:6, default:'000XXX' }, // Placa
    year: { type: Number },
    color: { type: String },
    sales_point: { type: String },
    sales_cod: {type:String, default:'' },
    dealer_cod: { type: String },

    use_type: {type: String },
    warranty_type: { type: String },
    warranty_duration: { type: Number },

    //Entradas a Mantenimiento
    maintenance:{type:Array},

    // Fechas de Inicio de Garantía
    
    date_p: { type:Date },
    date_runt: { type:Date },
    date_handover: { type:Date },
    date_retail: { type:Date },
    date_cont: { type:Date },
    date_init_warranty: { type:Date},
    date_end_warranty: { type:Date },
    
    vsr: { type: Number },
    uw: { type: String },
    
})

module.exports = mongoose.model('Vin', VinSchema)

