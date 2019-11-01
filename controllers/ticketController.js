'use strict'
const moment = require('moment')
const Ticket = require('../models/ticket')
const DCSI = require('../models/dcsi')
const Dealer = require('../models/dealer')
const Model = require('../models/model')

let dealersData = []
let dealerCity = []
let modelsCod = []
let typesAll = [
    'CASE',
    'CCLI',
    'RCOM',
    'RSEN',
    'ACCI',
    'RETO',
    'INTR',
    'GTIA',
    'MTO'
]

function getDealer (req, res, next){
    Dealer.aggregate([
        { $project:{
            _id:0,
            cl:"$dealer_cod",
            av:"$subname_dealer",
            dealer:"$name_dealer"
        }}
    ], (err, dealer)=>{
        if(err) return res.status(500).send({message:`Error al consultar los dealers`})
        dealersData = dealer;
        next()
    })
}
function getDealerByCity(req, res, next){
    Dealer.aggregate([
        { $group:{
            _id:{ city:"$city", dealer:"$dealer_cod", ab:"$subname_dealer" }
        }},
        { $group:{
            _id:"$_id.city",
            dealers:{ $push:{
                cl:"$_id.dealer",
                ab:"$_id.ab",
                avg:"",
                units:""
            } }
        }},
        { $project:{
            _id:0,
            city:"$_id",
            dealers:"$dealers"
        }},
        { $sort:{ city: 1 }}
    ], (err, dealer)=>{
        if(err) return res.status(500).send({message:`Error al consultar los dealers`})
        dealerCity = dealer;
        next()
    })
}

function getModelCod(req, res, next){
    Model.aggregate([
        { $group:{
            _id:{ model:"$model", des:"$description", vin:"$sixDigit" }
        }},
        { $group:{
            _id:"$_id.model",
            vins:{ $push:{
                des:"$_id.des",
                vin:"$_id.vin"
            } }
        } },
        { $project:{
            _id:0,
            model:"$_id",
            vins:"$vins"
        }}
    ], (err, models)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos ocurrió un error al obtener los modelos', err:err})
        modelsCod = models
        next()
    })
}

// Get data for Vin's Search
function getTicketByVin(req, res){
    let vin = req.body.vin;
    Ticket.find({vin:vin}, (err, tickets)=>{
        if(err) return res.status(500).send({msg:'Error al obtener las entradas'})
        res.status(200).send(tickets)
    })
}
function ticketControlUpload(req, res){
    
    let dateFrom = new Date(moment(req.body.year.toString()+'0101', 'YYYYMMDD').format());
    let dateTo = new Date(moment(dateFrom).add(1, 'year').format())

    let dealer = req.body.dealers
    Ticket.aggregate([
        { $match:{ bill_date:{$gte:dateFrom} }},
        { $match:{ bill_date:{$lte:dateTo} }},
        { $match:{ dealer_cod:{ $in:dealer} }},
        { $group:{
            _id:{ dealer:"$dealer_cod", month:{ $month:"$bill_date"} },
            reg:{ $sum:1}
        }},
        { $group:{
            _id:"$_id.dealer",
            avg:{ $avg:"$reg" },
            period: { $push:{
                month:"$_id.month",
                tickets:"$reg"
            }}
        }},
        { $project:{
            _id:0,
            cl:"$_id",
            avg:"$avg",
            period:"$period",
            ab:""
        }}

    ], (err, ticket)=>{
        if(err) return res.status(500).send({msg:'Error al obtener las entradas', err:err})
        if(ticket && ticket.length>0){
            for(let i of ticket){
                for(let j of dealersData){
                    if(i.cl == j.cl){
                        i.ab = j.av
                    }
                }
            }
            // Recordar funcion para organizar
            res.status(200).send(ticket)

        } else {
            res.status(200).send({msg:'No se encontraron resultados'})

        }
    })
}
// Kilometers Report
// Distribution: Public/Private
function distributionUseType(req, res){
    Ticket.aggregate([
        { $match:{ avgKmtMonth: { $exists:true, $ne:null  } }},
        { $match:{ date_init_warranty: { $exists:true, $ne:null  } }},
        { $match:{ monthsOnWay: { $exists:true, $ne:0  } }},
        { $match:{ use_type: { $exists:true, $ne:null  } }},
        { $group:{
            _id:{ use:"$use_type"},
            avg:{ $avg:"$avgKmtMonth"},
            total:{ $sum:1}
        }},
        { $project:{
            _id:0,
            use:"$_id.use",
            avgKm:"$avg",
            units:"$total"
        }}
    ], (err, distributionUseType)=>{
        if(err) return res.status(500).send({msg:'Error al obtener las entradas', err:err})
        res.status(200).send(distributionUseType)
    })
}

function kmMonthByCity(req, res){
   
    let dateInit = new Date(req.body.dateInit)
    let dateEnd = new Date(req.body.dateEnd)
    Ticket.aggregate([
        { $match:{ date_init_warranty: { $exists:true, $ne:null  } }},
        { $match:{ date_init_warranty:{ $gte:dateInit } }},
        { $match:{ date_init_warranty:{ $lte:dateEnd } }},
        { $match:{ avgKmtMonth: { $exists:true, $ne:null  } }},
        { $match:{ monthsOnWay: { $exists:true, $ne:0  } }},
        { $match:{ use_type: { $exists:true, $ne:null  } }},
        { $group:{
            _id:{ use_type:"$use_type", dealer:"$dealer_cod" },
            avg:{ $avg:"$avgKmtMonth"},
            total:{ $sum:1}
        }},
        { $match:{ 'avg':{$gte:0} } },
        { $group:{
            _id:"$_id.use_type",
            dealers:{
                $push:{
                    dealer:"$_id.dealer",
                    avg:"$avg",
                    units:"$total"
                }
            }
        } },
        { $project:{
            _id:0,
            use:"$_id",
            dealers:"$dealers"
        } }
    ], (err, kmMonthByCity)=>{
        if(err) return res.status(500).send({msg:'Error al obtener las entradas', err:err})
        if(kmMonthByCity && kmMonthByCity.length>0){
            const data = [];
            for(let i=0; i<dealerCity.length; i++){
                data.push({
                    city: dealerCity[i].city,
                    units:0,
                    avg:0,
                    data:[]
                })
                for(let j=0; j<kmMonthByCity.length; j++){
                    data[i].data.push({
                        use: kmMonthByCity[j].use,
                        avg:0,
                        units:0,
                        pond:0,
                        dealers:[]
                    })
                    for(let k=0; k<dealerCity[i].dealers.length; k++){

                        data[i].data[j].dealers.push({
                            cl: dealerCity[i].dealers[k].cl,
                            dealer: dealerCity[i].dealers[k].ab,
                            avg:0,
                            units:0
                        })
                        
                        for(let l=0; l<kmMonthByCity[j].dealers.length; l++){
                            if(data[i].data[j].dealers[k].cl == kmMonthByCity[j].dealers[l].dealer){
                                data[i].data[j].dealers[k].avg = Math.round(kmMonthByCity[j].dealers[l].avg)
                                data[i].data[j].dealers[k].units = kmMonthByCity[j].dealers[l].units
                                data[i].units += kmMonthByCity[j].dealers[l].units;

                                data[i].data[j].units += kmMonthByCity[j].dealers[l].units;
                                data[i].data[j].pond += kmMonthByCity[j].dealers[l].units * kmMonthByCity[j].dealers[l].avg
                            }
                        }
                    }
                    data[i].data[j].avg = Math.round(data[i].data[j].pond / data[i].data[j].units)
                }
            }
            data.sort((a,b)=>{
                if(a.units < b.units){
                    return 1
                }
                if(a.units < b.units){
                    return -1
                }
                return -1;
            })
            res.status(200).send(data)
        } else {
            res.status(200).send({msg:'lo sentimos no encontramos datos que mostrar'})
        }
    })
}

function kmMonthByModel(req, res){
    let dateInit = new Date(req.body.dateInit)
    let dateEnd = new Date(req.body.dateEnd)
    Ticket.aggregate([
        { $match:{ avgKmtMonth: { $exists:true, $ne:null  } }},
        { $match:{ date_init_warranty: { $exists:true, $ne:null  } }},
        { $match:{ date_init_warranty:{ $gte:dateInit } }},
        { $match:{ date_init_warranty:{ $lte:dateEnd } }},
        { $match:{ monthsOnWay: { $exists:true, $ne:0  } }},
        { $match:{ use_type: { $exists:true, $ne:null  } }},
        { $group:{
            _id:{ use:"$use_type", vin:{ $substr:["$vin", 0, 6] } },
            avg:{$avg:"$avgKmtMonth"},
            total:{ $sum:1}
        }},
        { $match:{ 'avg':{$gte:0} } },
        { $group:{
            _id:"$_id.use",
            vins:{ $push:{
                vin:"$_id.vin",
                avg:"$avg",
                units:"$total"
            }}
        }},
        { $project:{
            _id:0,
            use:"$_id",
            vins:"$vins"
        }}
    ], (err, KmModels)=>{
        if(err) return res.status(500).send({msg:'Ocurrió un error al obtener los datos por modelo', err:err})
        if(KmModels && KmModels.length>0){
            let data=[]
            for(let i=0; i<KmModels.length; i++){
                data.push({
                    use: KmModels[i].use,
                    models:[]
                })
                for(let j=0; j<modelsCod.length; j++){
                    data[i].models.push({
                        model: modelsCod[j].model,
                        avg:0,
                        units:0,
                        pond:0,
                        vins:[]
                    })
                    
                    for(let k=0; k<modelsCod[j].vins.length; k++){
                        data[i].models[j].vins.push({
                            vin: modelsCod[j].vins[k].vin,
                            des: modelsCod[j].vins[k].des,
                            avg:0,
                            units:0
                        })
                        for(let l=0; l<KmModels[i].vins.length; l++){
                            if(data[i].models[j].vins[k].vin == KmModels[i].vins[l].vin){
                                data[i].models[j].vins[k].avg = KmModels[i].vins[l].avg
                                data[i].models[j].vins[k].units = KmModels[i].vins[l].units
                                data[i].models[j].units += KmModels[i].vins[l].units
                                data[i].models[j].pond += KmModels[i].vins[l].units * KmModels[i].vins[l].avg
                            }
                        }
                        if(data[i].models[j].units != 0){
                            data[i].models[j].avg = Math.round(data[i].models[j].pond / data[i].models[j].units)
                        }
                    }
                }
            }
            if(data && data.length>0){
                for(let i of data){
                    i.models.sort((a,b)=>{
                        if(a.units < b.units){
                            return 1
                        }
                        if(a.units < b.units){
                            return -1
                        }
                        return -1;
                    })
                }
            }
            res.status(200).send(data)
        } else {
            res.status(200).send({msg:'No se encontraron datos'})
        }
    })
}

function getTicketByTypeIn(req, res){
    let dateFrom = new Date(moment(req.body.year.toString()+'0101', 'YYYYMMDD').format());
    let dateTo = new Date(moment(dateFrom).add(1, 'year').format())
    let types = []
    let dealer = req.body.dealers
    for(let i of typesAll){
        types.push( new RegExp(i))
    }

    Ticket.aggregate([
        { $match:{ bill_date:{$gte:dateFrom} }},
        { $match:{ bill_date:{$lte:dateTo} }},
        { $match:{ dealer_cod:{ $in:dealer } }},
        { $match:{ typeIn:{ $in:types} }},
        { $group:{
            _id:{ types:"$typeIn" },
            total:{ $sum:1}
        }},
        { $project:{
            _id:0,
            typesDirty:"$_id.types",
            type:"",
            units:"$total"
        }}
    ], (err, result)=>{
        if(err) return res.status(500).send({msg:'Ocurrió un error al obtener los tickets por Tipo de ingreso', err:err})
        if(result && result.length){
            let data = []
            for(let i of result){
                for(let j of typesAll){
                    let v = i.typesDirty.split(j)
                    if(v.length>1){
                        i.type = j
                    }
                }
            }
            for(let i=0; i<typesAll.length; i++){
                data.push({
                    type:typesAll[i],
                    units:0
                })
                for(let j of result){
                    if(data[i].type == j.type){
                        data[i].units += j.units
                    }
                }
            }
            res.status(200).send(data)

        } else {
        res.status(200).send(result)

        }
    })

    // res.status(200).send({msg:'funciona'})
}

//Send data for: Tickets projection
function getAllTickets(req, res){
    Ticket.find({}, (err, ticket)=>{
        if(err) return res.status(500).send(err)
        res.status(200).send(ticket)
    })
}
module.exports = {
    getDealer,
    getDealerByCity,
    getModelCod,

    getTicketByVin,
    ticketControlUpload,
    distributionUseType,
    kmMonthByCity,
    kmMonthByModel,
    getTicketByTypeIn,

    getAllTickets
}