'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const VinHistory = new Schema({
    // essential data: This data can get from vio
    vin:{ type:String, minlength:17, maxlength:17, unique:true },
    cod_model:{ type:String },
    description_model:{ type:String },
    origin:{ type:String },
    year_model:{ type:Number },

    date_init_warranty:{ type:Date },
    duration_warranty:{ type:Number },
    use_type:{ type:String, enum:['PUBLICO', 'PARTICULAR']},

    cl_sales:{ type:String, minlength:5, maxlength:5 },
    group_sales:{ type:String }, 
    city_sales:{ type:String },


    article:{ type:String},
    article_description:{ type:String},

    km_avg_estimate:{ type:Number }, //Kilometraje promedio por Mes => basado en la ciudad o en el kilometraje por modelo ?
    km_avg_calculated:{ type:Number },
    
    vsr:{ type:Number },
    year_operation:{ type:Number },
    // Data from Tickets

    
    // Esta se actualizará a medida que se carguen nuevas entradas
    last_ticket:{ type:Object, default:{
        type:'',
        cl:'',
        monthsOnWay:'',
        km:'',
        date:'',
    }},
    // Conteo de entradas
    tickets_total:{ type:Number },
    details_total:{ type:Object, deafult:{
        case:0,
        ccli:0,
        rcom:0,
        rsem:0,
        accl:0,
        reto:0,
        intr:0,
        gtia:0,
        mto:0,
        
    }},

    plate:{ type:String },

    mto_history:{ type:Array, deafault:[]},
    ticket_history:{ type:Array, deafault:[] }, // * 1.
    mto_projection:{ type:Array, deafault:[]},

    update:{ type:Date, default:new Date(Date.now()) },
    createup:{ type:Date, default:new Date( Date.now()) }
    
})


module.exports = mongoose.model('vinHistory', VinHistory)


// * Nota 1.
// Array de objetos de la siguiente forma:

// ticket_history = [{
//     type:"MTO_50",
//     date:"01/09/2018",
//     kmts:51351,
//     cl:"CL169",
//     city:'VALLEDUPAR'
// }]