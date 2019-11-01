'use strict'
const Dcsi = require('../models/dcsi')
const Ticket = require('../models/ticket')
const Dealer = require('../models/dealer')

// Get Filters
function getPer(req, res){
    Dcsi.aggregate([
        { $group: {
            _id: { $substr:[ "$date", 0, 6 ]}
        }},
        { $project:{
            _id:0,
            per:"$_id",
            from:{ $concat:[ "$_id", "01" ]},
            to:{ $concat:[ "$_id", "31" ]}
        }},
        { $sort:{ per:-1 }}
    ], (err, per)=>{
        if(err) return res.status(500).send({message:`Error al obtener los periodos ${err}`})
        res.status(200).send(per)
    })
}
function getDealer(req, res){
    let types = ['S1', '']
    Dealer.aggregate([
        { $match: { type_dealer:{ $nin:types} }},
        { $group: {
            _id: { dealer:"$dealer_cod", av:"$subname_dealer" }
        }},
        { $project:{
            _id:0,
            cl:"$_id.dealer",
            av:"$_id.av"
        }},
        { $sort:{ av:1 }}
    ], (err, per)=>{
        if(err) return res.status(500).send({message:`Error al obtener los cl ${err}`})
        res.status(200).send(per)
    })
}
function getDcsi (req, res){
    Dcsi.aggregate([
        { $group:{
            _id:"$cod_dcsi"
        }},
        { $project:{
            _id:0,
            dcsi:"$_id"
        }},
        { $sort: { dcsi:1} }
    ], (err, dcsi)=>{
        if(err) return res.status(500).send({message:`Error al obtener los DCSI ${err}`})
        res.status(200).send(dcsi)
    })
}

/*
/* DCSI'S FUNCTIONS 
/* 
*/
function getDCSIData(req, res){
    let limit = parseInt(req.body.limit)
    let fromDate = parseInt(req.body.fromDate)
    let toDate = parseInt(req.body.toDate)
    let skip = parseInt(req.body.skip)
    let cl = req.body.cl
    let dcsi = req.body.dcsi

    Dcsi.aggregate([
        { $match: { date:{ $lte:toDate } }},
        { $match: { date:{ $gte:fromDate } }},
        { $match: { cod_dealer:{ $in:cl } }},
        { $match: { cod_dcsi:{ $in:dcsi } }},
        { $skip: skip},
        { $limit:limit }
    ],(err, dcsi)=>{
        if(err) return res.status(500).send({message:`Error al realizar la consulta ${err}`})
        if(dcsi.length < 1){
            res.status(200).send({message:`No se encontraron Resultados.`})
        } else {
            res.status(200).send(dcsi)
        }
        
    })
}
function getDCSIDataCount(req, res){
    let fromDate = parseInt(req.body.fromDate)
    let toDate = parseInt(req.body.toDate)
    let cl = req.body.cl
    let dcsi = req.body.dcsi

    Dcsi.aggregate([
        { $match: { date:{ $lte:toDate } }},
        { $match: { date:{ $gte:fromDate } }},
        { $match: { cod_dealer:{ $in:cl } }},
        { $match: { cod_dcsi:{ $in:dcsi } }},
        { $count: "total"}
    ],(err, dcsi)=>{
        if(err) return res.status(500).send({message:`Error al realizar la consulta ${err}`})
        
        res.status(200).send(dcsi)
    })
}
function deleteDCSIData(req, res){
    
    let fromDate = parseInt(req.body.fromDate)
    let toDate = parseInt(req.body.toDate)
    let cl = req.body.cl
    let dcsi = req.body.dcsi
    Dcsi.deleteMany({
        date: { $gte:fromDate, $lte:toDate },
        cod_dealer: { $in:cl},
        cod_dcsi: { $in: dcsi}
    }, (err)=>{
        if(err) return res.status(500).send({message:`Error al Borrar el registro ${err}`, count:1})
        res.status(200).send({message:`Registro Borrado ${err}`, count:1})
    })
}
function deletDupliesDCSIData(req, res){
    let fromDate = parseInt(req.body.fromDate)
    let toDate = parseInt(req.body.toDate)
    let cl = req.body.cl
    let dcsi = req.body.dcsi
    Dcsi.aggregate([
        { $match: { date:{ $lte:toDate } }},
        { $match: { date:{ $gte:fromDate } }},
        { $match: { cod_dealer:{ $in:cl } }},
        { $match: { cod_dcsi:{ $in:dcsi } }},
        { $group:{
            _id: { lead_id:"$lead_id", type:"$type", cod_dcsi:"$cod_dcsi" },
            dups: { $push:"$_id" },
            count: { $sum: 1},
        } },
        { $match: { count: { "$gt": 1 } }}
    ], (err, dups)=>{
        if(err) return res.status(500).send(err)
        if(dups && dups.length > 0){
            for(let i of dups){
                i.dups.shift();
            }
            let duplies = []
            for(let i of dups){
                for(let j of i.dups){
                    duplies.push(j)
                }
            }
            Dcsi.remove({_id:{ $in: duplies }}, (err)=>{
                if(err) return res.status(200).send(err)
                return res.status(200).send({message:`Se han quitados los duplicados`})
            })
        } else {
            res.status(200).send({message:`No se encontraron duplicados`})
        }
        
    })
}

/*
/* TICKET'S FUCNTIONS 
/* 
*/
function getTicketData(req, res){
    let dealers = req.body.dealers;
    let kmFrom = req.body.kmFrom;
    let kmTo = req.body.kmTo;
    let dateFrom = new Date(req.body.dateFrom);
    let dateTo = new Date(req.body.dateTo);
    let skip = req.body.skip;
    let limit = parseInt(req.body.limit);
    Ticket.find({
        dealer_cod:dealers, 
        kilometers:{ $gte:kmFrom, $lte:kmTo },
        bill_date:{ $gte:dateFrom, $lte:dateTo}
    }, (err, tickets)=>{
        if(err) return res.status(500).send({message:`Error al obtener los periodos ${err}`})
        if(tickets && tickets.length<1){
            res.status(200).send({message:`No se encontraron Resultados.`})
        } else {
            res.status(200).send(tickets)
        }
    }).skip(skip).limit(limit)
}

function getTicketDataCount(req, res){
    let dealers = req.body.dealers;
    let kmFrom = req.body.kmFrom;
    let kmTo = req.body.kmTo;
    let dateFrom = new Date(req.body.dateFrom);
    let dateTo = new Date(req.body.dateTo);
    Ticket.count({
        dealer_cod:dealers, 
        kilometers:{ $gte:kmFrom, $lte:kmTo },
        bill_date:{ $gte:dateFrom, $lte:dateTo}
    }, (err, tickets)=>{
        if(err) return res.status(500).send({message:`Error al obtener los periodos ${err}`})
        if(tickets && tickets.length<1){
            res.status(200).send({message:`No se encontraron Resultados.`})
        } else {
            res.status(200).send({count:tickets})
        }
    })
}

function deletTicketsData(req, res){
    let dealers = req.body.dealers;
    let kmFrom = req.body.kmFrom;
    let kmTo = req.body.kmTo;
    let dateFrom = new Date(req.body.dateFrom);
    let dateTo = new Date(req.body.dateTo);
    Ticket.deleteMany({
        dealer_cod:dealers, 
        kilometers:{ $gte:kmFrom, $lte:kmTo },
        bill_date:{ $gte:dateFrom, $lte:dateTo}
    }, (err,)=>{
        if(err) return res.status(500).send({message:`Error al Borrar el registro ${err}`, count:1})
        res.status(200).send({message:`Registro Borrado ${err}`, count:1})
    })
}

module.exports = {
    getPer,
    getDealer,
    getDcsi,
    getDCSIData,
    getDCSIDataCount,
    deleteDCSIData,
    deletDupliesDCSIData,
    getTicketData,
    getTicketDataCount,
    deletTicketsData
}