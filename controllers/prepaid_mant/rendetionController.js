'use strict'

//RETENTION CONTROLLER

const ORDER = require('../../models/orderPackage');

function getActives(req, res){
	ORDER.aggregate([
			{ $match:{ 'status.5.active':true }}
		], (error, result)=>{
		if(error) return res.status(500).send({message:'Error al obtener los paquetes activos', error:error})
		res.status(200).send(result)
	})
}

function getToRedeem(req, res){
	let search = req.body.search;
	let vin = new RegExp(req.body.vin, 'i');
	let plate = new RegExp(req.body.plate, 'i');
	if(search && search.length === 17){
		vin = new RegExp(req.body.search, 'i');
		plate = new RegExp('', 'i');
	} else if(search && search.length === 6) {
		vin = new RegExp('', 'i');
		plate = new RegExp(req.body.search, 'i');
	} else {
		return res.status(500).send({find:false, message:'No hay datos que buscar, escribe el VIN o la placa del vehículo'})
	}
	
	ORDER.aggregate([
			{ $match:{ vin : vin }},
			{ $match:{ 'form.plate':plate }},
			{ $match:{ 'status.5.active':true }},
			{ $project:{
				_id:0,
				id:"$_id"
			}}
		], (error, result)=>{
		if(error) return res.status(500).send({message:'Error al obtener la información', error:error})
		if(result && result.length>0){
			let id = result[0].id
			res.status(200).send({find:true, message:'Estamos redirigiendo', data:id})
		} else {
			res.status(200).send({find:false, message:'No se encontro ningun VIN o Placa asociada'})
		}
		
	})
}

module.exports = {
	getActives,
	getToRedeem
}