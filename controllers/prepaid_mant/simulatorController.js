'use strict';

const VARIABLES = require('../../models/variables');
const MODELTEMPLATE = require('../../models/modelTemplateMant');
const REFERENCE = require('../../models/reference');
const PREPAID = require('../../models/prepaid');
const decode = require('../vinFilterController');

let variables = [];
let modelTemplate = {};
let prepaid = []
let references = [];
let general = [];

// Parametros necesarios:
	//version, Distribuidor CL
function getGeneralTemplate(){
	general = [];
	for(let i=0;  i<10; i++){
		general.push({
            article:'',
            vm:1,
			routine:(i+1)*5,
            tempario:0,
            parts:0,
            partsDetails:[],
            tax:0,
            mo:0,
            subTotal:0, // Sin IVA
            total:0, //Incluye IVA
            pSupply:0, // Insumos Prepagado
            pHours:0, // Horas Prepagado
            supply:0,
            fmeTotal:0, // Mes entrada
            futureFactor:0, // Factor valor futuro
            futureValue:0,
            accumulated:0,

            pMo:0, //Mano de obra afectada por el factor diferencial
            pParts:0, //partes mantenimiento prepagado - descuento
            pSubTotal:0, // 
            pTotal:0,
            pFutureValue:0,
            pAccumulated:0,
            redeem:false,
            valueToRedeem:0,
            dateRedeem:'',
            dealerRedeem:'',
            adviserRedeem:'',
            redeemStatus:'noRedeem', // 'noRedeem // redeem // expired // returned'
            expirationDate:'',
            kiaOnTimeLink:'',
            attach:[]
		})
	}
}

function getVAraibles(req, res, next){
	VARIABLES.find({}, (error, data)=>{
		if(error) return res.status(500).send(error)
		variables = data;
		next();
	})
}

function getModelByDealer(req, res, next){
	let dfv = decode.getDataFromVersion(req.body.version);
	let model = dfv.decode.line;
    let cl = req.body.cl;
        
	MODELTEMPLATE.findOne({cl:cl, cod:model}, (error, data)=>{
		if(error) return res.status(500).send(error)
		modelTemplate = data;
		next();
	})
}

function getTemplateForSimulator(req, res, next){
    PREPAID.aggregate([
        { $group:{
            _id:{ routine:"$mto", offPartsImp:"$offPartsImp", offPartsCon:"$offPartsCon", offPartsTotal:"$offPartsTotal", hours:"$hours" }
        }},
        { $project:{
            _id:0,
            routine:"$_id.routine",
            offPartsImp:"$_id.offPartsImp",
            offPartsCon:"$_id.offPartsCon",
            offPartsTotal:"$_id.offPartsTotal",
            hours:"$_id.hours"
        }}
    ], (error, template)=>{
        if(error) return res.status(500).send(error)
    	prepaid = template;
    	next();
    })
}

function getReferencesByModel(req, res, next){

	let dfv = decode.getDataFromVersion(req.body.version);
    
    let model = new RegExp(dfv.decode.line); //Hace referencia al código de modelo
    if(dfv.decode.line === 'ST'){
        model = RegExp('SC');
    }
    let aa = new RegExp(dfv.decode.aa, 'i');
    let displacement = parseInt(dfv.decode.displacement);
    let motor = dfv.decode.motor;
    let transmission = dfv.decode.transmission;
    const dataToLog = { model, aa, displacement, motor, transmission }

    REFERENCE.aggregate([
        { $match:{ active:true }},
        { $match:{ model:model }},
        { $match:{ aa:{ $in:['', null, aa]} }},
        { $match:{ displacement:{ $in:['', null, displacement] } }},
        { $match:{ motor:{ $in:['', null, motor]} }},
        { $match:{ transmission:{ $in:[ '', null, transmission]} }},
        { $group:{
            _id:{ routine:"$routine", ref:"$ref", amount:"$amount", description:"$description", motor:"$motor", transmission:"$transmission", displacement:"$displacement", pvp:"$pvp"}
        }},
        { $group:{
            _id:"$_id.routine",
            total:{ $sum:{ $multiply:["$_id.pvp", "$_id.amount"] }},
            details:{ $push:{
                ref:"$_id.ref",
                description:"$_id.description",
                motor:"$_id.motor", 
                transmission:"$_id.transmission", 
                displacement:"$_id.displacement", 
                pvp:"$_id.pvp",
                amount:"$_id.amount",
                subTotal:{ $multiply:["$_id.pvp", "$_id.amount"]}
            }}
        }},
        { $project:{
            _id:0,
            routine:"$_id",
            valueRoutine:"$total",
            details:"$details"
        }},
        { $sort:{ routine:1 }}
    ], (error, result)=>{
        	console.log(error)
        if(error) return res.status(500).send(error)
            console.log(references)
        references = result;
    	next();
    })
}

function topMulti(value){
    let mod = value % 10000;
    if(mod > 0){
        return (parseInt((value / 10000)) + 1) * 10000
    } else {
        return value;
    }
}
function transform(req, res){
	let dfv = decode.getDataFromVersion(req.body.version);
    let getModel = dfv.decode.line; //Hace referencia al código de modelo

	getGeneralTemplate();

	//Validación de Información: Esto se asegura que los demas servicios tienen información disponible
	if(!(variables && variables.length>0)) return res.status(500).send({message:'Lo sentimos ocurrió un error al obtener las variables'});
	if(!(modelTemplate)) return res.status(500).send({message:'Lo sentimos ocurrió un error al obtener los temparios de este modelo'})
	if(!(references && references.length>0)) return res.status(500).send({message:'Lo sentimos ocurrió un error al obtener los repuestos para este modelo'})		
	//Recorrer la variables
	let iva = 0;
	let fme = 0;
	let ipc = 0;
	let momp = 0; //Mano de obra Mantenimiento Prepagado
	let supply = 0; //Insumos Mantenimiento Prepagado
	let factor = 0;
    let com = 0;
	//Asignación de las variables
	variables.map( (i)=>{
		switch(i.name){
			case 'IVA': iva = i.value/100; break;
			case 'FME': fme = i.value; break;
			case 'IPC': ipc = i.value; break;
			case 'MOMP': momp = i.value; break;
			case 'INSUMO': supply = i.value; break;
            case 'COM': com = i.value; break;
			case getModel: factor = i.value; break;
		}
	} )
	
	//Asignación de tempario del concesionario a la plantilla General

	general.map( (i, index)=>{
        i.article = req.body.version;
		i.tempario =  parseFloat(modelTemplate['mto'+(index+1)*5]);
        i.supply = modelTemplate.supply;
        i.mo = Math.round( modelTemplate.mo * parseFloat(modelTemplate['mto'+(index+1)*5]) );
        i.fmeTotal = (index+1) * fme;
        i.pSupply = supply;
	})

	//Asignación de los repuestos utilizados en cada rutina
	general.map( (i, index) =>{
        i.parts = 0;
        i.partsDetails = []

        for(let j of references){
            if(i.routine % j.routine === 0){
                i.parts += Math.round(j.valueRoutine);
                i.tax = iva;
                i.partsDetails.push(j.details)
            }
        }
    } )
	//Cálculo de totales, y factor de proyecciónt 
    general.map( (i, index)=>{ 
        i.subTotal = i.mo + i.parts + i.supply;
        i.total = (i.mo + i.parts + i.supply)*(i.tax+1);
        i.tax = (i.mo + i.parts + i.supply) * i.tax; 
        i.futureFactor = Math.pow( 1+((ipc/100)/12), ((index+1)*fme) );
    } )

    general.map( (i, index)=>{
        i.futureValue = parseFloat(i.futureFactor) * parseFloat(i.total);
    } )

    general.map( (i, index)=>{
        if(index>0){
            i.accumulated = topMulti(i.futureValue + general[index-1].accumulated)
        } else {
            i.accumulated = i.futureValue
        }
        return true;
    } )

    //Asignación Temparios de Mantenimiento Prepagado
    general.map( (i, index)=>{
       	prepaid.map( (j, jndex)=>{
            if(i.routine === j.routine){ 
                
                i.pParts = ((100 - j.offPartsTotal)/100) * i.parts;
                i.pHours = (j.hours * factor);
                i.pMo = ((j.hours * factor) * momp) + com; //Valor Mano de Obra
                i.pSubTotal =(((100 - j.offPartsTotal)/100) * i.parts) + ((j.hours * factor) * momp) + com;
                i.pTotal = ((((100 - j.offPartsTotal)/100) * i.parts) + (((j.hours * factor) * momp)+ com) + supply) * (1+iva);
                i.pFutureValue = (((((100 - j.offPartsTotal)/100) * i.parts) + (((j.hours * factor) * momp) + com) + supply) * (1+iva)) * i.futureFactor
            }
        } )
    } )

    //Acumulado de mantenimiento Prepagado

    general.map( (i, index)=>{
        if(index>0){
            i.pAccumulated = topMulti(i.pFutureValue + general[index-1].pAccumulated); 
            i.valueToRedeem = topMulti(i.pFutureValue + general[index-1].pAccumulated) - general[index-1].pAccumulated;
        } else {
            i.pAccumulated = i.pFutureValue;
            i.valueToRedeem = i.pFutureValue;
        }
        
    } )

	res.status(200).send(general)
}


module.exports = {
	getVAraibles,
	getModelByDealer,
	getReferencesByModel,
	getTemplateForSimulator,
	transform
}
