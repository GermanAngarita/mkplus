'use strict'

const Reference = require('../models/reference');

function create(req, res){
    const reference = new Reference({
        model: req.body.model,
        ref: req.body.ref,
        description: req.body.description,
        cost: req.body.cost,
        amount: req.body.amount,
        routine: req.body.routine,
        pvc: req.body.pvc,
        pvp: req.body.pvp,
        mg_pvc: req.body.mg_pvc,
        mg_pvp: req.body.mg_pvp,
        createup: new Date( Date.now()),
        active: true,
        motor: req.body.motor,
        aa: req.body.aa,
        transmission: req.body.transmission,
        displacement: req.body.displacement
    })

    reference.save( (error)=>{
        if(error) return res.status(200).send(error);
        res.status(200).send({msg:'Se ha creado la referencia'})
    } )
}

function getReferences(req, res){
    let active = req.body.active;
    let limit = req.body.itemsPerpage;
    let skip = req.body.skip;
    let model = new RegExp (req.body.model, 'i');
    let ref = new RegExp(req.body.ref, 'i');
    let description = new RegExp(req.body.description, 'i');
    let routine = [5, 10, 20, 40, 50];
    if(req.body.routine !== ''){
        routine = [req.body.routine];
    }

    Reference.find({ 
        active:active,
        model: model,
        ref: ref,
        description: description,
        routine: routine
     }, (err, result)=>{
        if(err) return res.status(200).send(err);
        res.status(200).send(result)
    }).skip(skip).limit(limit).sort("model")
}

function getCountReference(req, res){
    let active = req.body.active;
    let model = new RegExp (req.body.model, 'i');
    let ref = new RegExp(req.body.ref, 'i');
    let description = new RegExp(req.body.description, 'i');
    let routine = [5, 10, 20, 40, 50];
    if(req.body.routine !== ''){
        routine = [req.body.routine];
    }
    Reference.count({
        active:active,
        model: model,
        ref: ref,
        description: description,
        routine: routine
    }, (err, result)=>{
        if(err) return res.status(500).send(err);
        res.status(200).send({count:result})
    })
}

function updateReference(req, res){
    let id = req.body._id;
    let body = req.body

    Reference.findByIdAndUpdate(id, body, (error, success)=>{
        if(error) return res.status(500).send(error)
        res.status(200).send({message:'Actualizado con éxito'})
    })
}

function getReferencesByModel(req, res){
    let model= req.body.model; //Hace referencia al código de modelo

    let aa = req.body.aa;
    let bodywork = req.body.bodywork;
    let displacement = req.body.displacement;
    let motor = req.body.motor;
    let packageEquip = req.body.packageEquip;
    let transmission = req.body.transmission;
    console.log(req.body)
    Reference.aggregate([
        { $match:{ active:true }},
        { $match:{ model:model }},
        { $match:{ aa:{ $in:[null, aa]} }},
        { $match:{ displacement:{ $in:[null, displacement]} }},
        { $match:{ motor:{ $in:[null, motor]} }},
        { $match:{ transmission:{ $in:[ null, transmission]} }},
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
        if(error) return res.status(500).send(error)
        res.status(200).send(result)
    })
}

module.exports = {
    create,
    getReferences,
    updateReference,
    getCountReference,
    getReferencesByModel
}