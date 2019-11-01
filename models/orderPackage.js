'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const OrderPackageSchema = new Schema ({
	vin:{ type:String, unique:true },
	carNumber1:{ type:Number },
	cardRequisition:{ type:Boolean, default:false },
	number:{ type:String, unique:true},
	dealer:{ type:String },
	adviser:{ type:String },
	article:{ type:String, required:true },
	form:{ type:Object},
	plan:{ type:Object},
	projection:{ type:Array },
	status:{ type:Array },
	version:{ type:Object },
	attach:{ type:Array, default:[]},
	wayToPay:{ type:String, default:"C" }, //C=Contado, F=Financiado Vehículo, I=Financiación Independiente
	activationDate:{ type:Date },
	expirationDate:{ type:Date },
	create_at: { type:Date, default: new Date( Date.now() ) },
	sendedEmail:{ type:Boolean, default:false }
})

module.exports = mongoose.model('orderPackage', OrderPackageSchema)

//Attach Object
//let object = {
//	title:'Nombre del adjunto',
//	comentarios:'Comentaior u observaciones',
//	url:'Hace referencia al adjunto en el servior',
//	create_at:'fecha en la que fue creado'
//}