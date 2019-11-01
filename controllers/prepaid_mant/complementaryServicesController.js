'use strict'

const ComplementaryServices = require('../../models/complementaryServices');

function create(req, res){
	const compService = new ComplementaryServices({
		create: new Date( Date.now() ),
		service: req.body.service,
		frequency: req.body.frequency,
		amount: req.body.amount,
		terms: req.body.terms,
		active: req.body.active,
		group: req.body.group,
		key: req.body.service+req.body.group
	})

	if(!compService.service) return res.status(500).send({message:'Escriba el nombre del servicio'})
	if(!compService.frequency) return res.status(500).send({message:'Elija una freqcuencia'})

	if(!compService.terms) return res.status(500).send({message:'Escrba los términos y condiciones para este servicio'})
	if(!compService.group) return res.status(500).send({message:'El beneficio debe pertenecer a una concesión'})

	compService.save( (err)=>{
		if(err) return res.status(500).send({message:'Error al crear el servicio', error:err})
		res.status(200).send({message:'El servicio se ha creado con éxito'})
	} )
}

function read(req, res){
	let group = req.body.group

	if(group === 'All'){
		group = new RegExp('', 'i')
	}

	ComplementaryServices.aggregate([
		{ $match:{ group:group}},
		{ $project:{
			_id:0,
			id:"$_id",
			service:"$service",
			frequency:"$frequency",
			active:"$active",
			amount:"$amount",
			create:"$create",
			terms:"$terms",
			
			group:"$group"
		}}

	], (err, success)=>{
		if(err) return res.status(500).send({message:'Error al obtener los servicios', error:err})
		res.status(200).send(success)
	})
}

function update(req, res){
	let id = req.body.id
	let body = req.body
	ComplementaryServices.findByIdAndUpdate({_id:id}, body, (err, sucess)=>{
		if(err) return res.status(500).send({message:'Error al actualizar el servicio', error:err})
			res.status(200).send({message:'Servicio actualizado con éxito'})
	})
}

module.exports = {
	create,
	read,
	update
}

// create:{ type:Date, default: new Date( Date.now() )},
// service:{ type:String },
// frequency:{ type:Number },
// amount:{ type:Number },
// terms:{ type:String },
// active:{ type:Boolean, default:true },
// dealer:{ type:String, minlength:5, maxlength:5 }