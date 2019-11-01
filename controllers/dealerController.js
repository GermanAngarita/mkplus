'use strict'

const Dealer = require('../models/dealer')

function newDealer (req, res){
    const dealer = new Dealer({
        dealer_cod: req.body.dealer_cod,
        name_dealer: req.body.name_dealer,
        subname_dealer: req.body.subname_dealer,
        address: req.body.address,
        city: req.body.city,
        group_dealer:req.body.group_dealer,
        coordinate: req.body.coordinate,
        type_dealer: req.body.type_dealer,
        zone: req.body.zone,
        zoneC: req.body.zoneC,
        mo_cli_taller: req.body.mo_cli_taller,
        colision: req.body.colision,
        express_service: req.body.express_service,
        showroom: req.body.showroom,
        launge: req.body.launge,
        // a: req.body.a,
        // b: req.body.b,
        // c: req.body.c,
        // d: req.body.d,
        // supplies: req.body.supplies
    })
    dealer.save((err)=>{
        if(err) return res.status(500).send({message:`ha ocurrido un error al registrar el Dealer`})
        return res.status(200).send({dealer:dealer})
    })
}

function editDealer(req, res) {
    let update = req.body
    let dealerId = req.params.dealerId

    Dealer.findByIdAndUpdate(dealerId, update, (err, dealer)=>{
        if(err) return res.status(500).send({message: `Error al actualizar el registro ${err}`})
        return res.status(200).send({dealer: dealer})
    })
}

function getDealers (req, res){
    Dealer.find({}, (err, dealers)=>{
        if(err) return res.status(500).send({message:`ha ocurrido un error ${err}`})
        if(!dealers) return res.status(404).send({message:`No existen Dealers`})
        return res.status(200).send({dealers:dealers})
    }).sort({name_dealer:1})
}

function dealerByZone(req, res){
    Dealer.aggregate([
        { $group: { _id:{ zone:"$zone", cl:"$dealer_cod" }, count: { $sum: 1}} },
        { $group: {
            _id:"$_id.zone",
            cl: { $push: { cl:"$_id.cl", select:true }}
        }},
        { $project: {
            _id:"$_id",
            select:"1",
            cl:"$cl"
        } }
    ], (err, dealerByZone)=>{
        if(err) return res.status(500).send({message:`Error: ${err}`})
        res.status(200).send(dealerByZone)
    })
}

function dealerByZoneWarrantys(req, res){
    Dealer.aggregate([
        { $group: { _id:{ zone:"$zoneG", cl:"$dealer_cod" }, count: { $sum: 1}} },
        { $group: {
            _id:"$_id.zone",
            cl: { $push: { cl:"$_id.cl", select:true }}
        }},
        { $project: {
            _id:0,
            zone:"$_id",
            select:{ $sum:0 },
            cl:"$cl"
        } },
        { $sort:{ zone:1 }}
    ], (err, dealerByZone)=>{
        if(err) return res.status(500).send({message:`Error: ${err}`})
        res.status(200).send(dealerByZone)
    })
}

function dealerByGroup(req, res){
    Dealer.aggregate([
        { $match: { type_dealer:{ $in:['S2', 'S3']}}},
        { $group: { _id:{ group:"$group_dealer", name:"$name_dealer", ab:"$subname_dealer", cl:"$dealer_cod"},  count:{ $sum: 1} } },
        { $sort: { _id:-1 }},
        { $group: {
            _id:"$_id.group",
            cl_group:{ $push:{ cl:"$_id.cl", name:"$_id.name", ad:"$_id.ab", select:false }}
        } },
        { $project: {
            _id:0,
            group:"$_id",
            select:"false",
            cl:"$cl_group"
        }},
        { $sort:{group:1}}
    ], (err, dealerByGroup)=>{
        if(err) return res.status(500).send({message:`Error: ${err}`})
        res.status(200).send(dealerByGroup)
    })
}

function dealerByDealer(req, res){

    let dealer = req.body.dealer
    
    Dealer.aggregate([
        {$match: { dealer_cod:{ $in: dealer }}},
        { $project:{
            d_cod:"$dealer_cod",
            d_name:"$name_dealer",
            d_subname:"$subname_dealer",
            city:"$city",
            address:"$address",
            group_dealer:"$group_dealer",
            zone:"$zone",
            select:"true"
        }}
    ], (err, dealerByDealer)=>{
        if(err) return res.status(500).send({message:`Error: ${err}`})
        res.status(200).send( dealerByDealer )
    })
}

function getDealerById(req, res){
    let id = req.body.id
    Dealer.findById(id, (err, dealer)=>{
        if(err) return res.status(500).send({msg:'Error al obtener al dealer', err:err})
        res.status(200).send(dealer)
    })
}

function getDealerByCity(req, res){
    Dealer.aggregate([
        { $group:{
            _id:{ city:"$city", 
            cl:"$dealer_cod", 
            group:"$group_dealer", 
            dealer:"$name_dealer", 
            address:"$address",
            type:"$type_dealer",
            telephone:"$telephone" }
        }},
        { $group:{
            _id:"$_id.city",
            cl:{ $push:{
                cl:"$_id.cl",
                group:"$_id.group",
                dealer:"$_id.dealer",
                address:"$_id.address",
                type:"$_id.type",
                telephone:"$_id.telephone"
            }}
        } },
        { $project:{
            _id:0,
            city:"$_id",
            cl:"$cl"
        }},
        { $sort: {city:1}}
    ], (err, citys)=>{
        if(err) return res.status(500).send({msg:'Error al obtener las ciudades', err:err})
        res.status(200).send(citys)
    })
}

module.exports = {
    newDealer,
    getDealers,
    editDealer,
    dealerByZone,
    dealerByGroup,
    dealerByDealer,
    getDealerById,
    getDealerByCity,
    dealerByZoneWarrantys
}