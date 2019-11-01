'use strict'

const moment = require('moment')

const Vin = require('../models/vin')
const Ticket = require('../models/ticket')
const Dealer = require('../models/dealer')
const Models = require('../models/model')
const VinRetention = require('../models/vinRetention')


let ticketResult = []
let ticketResultSales = []
let unitsResult = []
let dealersData = []
let models = []
let VIOByModel = []
let TICKETS = []
let typesToMTO = ['MTO', 'MANT']
let typesToRetention = ['CCLI','RCOM', 'RSEN', 'ACCI','MTO', 'MANT']
let typesNoRetention = ['CASE', 'RETO', 'INTR', 'GTIA']
let typesAll = ['CASE','CCLI','RCOM', 'RSEN', 'ACCI', 'RETO', 'INTR', 'GTIA', 'MTO' ]

// Get Data Prepend
// getTicket es usado en la vista Entradas a MTO
function getTicket(req, res, next){
    let dateInit = new Date(moment(req.body.dateIn, 'DD/MM/YYYY').format())
    let dateFin = new Date(moment(req.body.dateFin, 'DD/MM/YYYY').format())
    let types = []
    for(let i of typesToMTO){
        types.push( new RegExp(i))
    }
    Ticket.aggregate([
        { $match:{ typeIn:{ $in:types } }},
        { $match:{ avgKmtMonth: { $exists:true, $ne:null  } }},
        { $match:{ date_init_warranty: { $exists:true, $ne:null  } }},
        { $match:{ monthsOnWay: { $exists:true, $ne:0  } }},
        { $match:{ use_type: { $exists:true, $ne:null  } }},
        { $match: { bill_date:{ $lte:dateFin, $gte:dateInit } }},
        { $group:{
            _id:{ use:"$use_type", cl:"$dealer_cod" },
            total:{ $sum:1 }
        }},
        { $group:{
            _id:"$_id.use",
            dealers:{ $push:{
                cl:"$_id.cl",
                units:"$total"
            } }
        } },
        { $project:{
            _id:0,
            use:"$_id",
            dealers:"$dealers"
        }}
    ], (err, result)=>{
        if(err) return res.status(500).send({msg:`Lo sentimos ocurrió un error al obtener los Vehículos en garantía del periodo ${moment(dateInit).format('DD-MM-YYYY')} a ${moment(dateFin).format('DD-MM-YYYY')}`, err:err})
        ticketResult = result;
        next();
    })
}

function getTicketSales(req, res, next){
    let dateInit = new Date(moment(req.body.dateIn, 'DD/MM/YYYY').format())
    let dateFin = new Date(moment(req.body.dateFin, 'DD/MM/YYYY').format())
    let types = []
    for(let i of typesToMTO){
        types.push( new RegExp(i))
    }
    Ticket.aggregate([
        { $match:{ typeIn:{ $in:types } }},
        { $match:{ avgKmtMonth: { $exists:true, $ne:null  } }},
        { $match:{ date_init_warranty: { $exists:true, $ne:null  } }},
        { $match:{ monthsOnWay: { $exists:true, $ne:0  } }},
        { $match:{ use_type: { $exists:true, $ne:null  } }},
        { $match: { bill_date:{ $lte:dateFin, $gte:dateInit } }},
        { $group:{
            _id:{ use:"$use_type", cl:"$dealer_cod", clSales:"$dealer_sales" },
            total:{ $sum:1 }
        }},
        { $group:{
            _id:"$_id.use",
            dealers:{ $push:{
                cl:"$_id.cl",
                units:"$total"
            } }
        } },
        { $project:{
            _id:0,
            use:"$_id",
            dealers:"$dealers"
        }}
    ], (err, result)=>{
        if(err) return res.status(500).send({msg:`Lo sentimos ocurrió un error al obtener los Vehículos en garantía del periodo ${moment(dateInit).format('DD-MM-YYYY')} a ${moment(dateFin).format('DD-MM-YYYY')}`, err:err})
        ticketResultSales = result;
        next();
    })
}

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

// Funciones de retención
function getUIWByDate(req, res){
    let dateInit = new Date(moment( req.body.dateIn, 'DD/MM/YYYY').format())
    let dateFin = new Date(moment( req.body.dateFin, 'DD/MM/YYYY').format())
    let use = req.body.use;
    let orderBy = req.body.orderBy
    let dealers = req.body.dealers
    Vin.aggregate([
        { $match:{ use_type:use } },
        { $match:{ dealer_cod:{ $in:dealers } }},
        { $match:{ dealer_cod:{ $ne:'OTHERSWWW'} }},
        { $match:{ date_init_warranty:{ $lte:dateInit } }},
        { $group:{
            _id:{ use:"$use_type", cl:"$dealer_cod" },
            total:{ $sum:{ $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 0 ] },
            1,
            { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 1 ] },
                0.99,
                { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 2 ] },
                    0.97,
                    { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 3 ] },
                        0.94,
                        { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 4 ] },
                            0.88,
                            { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 5 ] },
                                0.8,
                                { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 6 ] },
                                    0.69,
                                    { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 7 ] },
                                        0.56,
                                        { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 8 ] },
                                            0.44,
                                            { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 9 ] },
                                                0.32,
                                                { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 10 ] },
                                                    0.21,
                                                    { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 11 ] },
                                                        0.14,
                                                        { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 12 ] },
                                                            0.06,
                                                            { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 13 ] },
                                                                0,
                                                                { $cond:[ { $gt:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 13 ] },
                                                                    0,
                                                                    0
                                                                ] }
                                                            ] }
                                                        ] }
                                                    ] }
                                                ] }
                                            ] }
                                        ] }
                                    ] }
                                ] }
                            ] }
                        ] }
                    ] }
                ] }

             ] }
        ]} }
        }},
        { $group:{
            _id:"$_id.use",
            dealer:{ $push:{
                cl:"$_id.cl",
                units:"$total"
            }}
        }},
        { $project:{
            _id:0,
            use:"$_id",
            dealers:"$dealer"
        }}
    ], (err, vins)=>{
        if(err) return res.status(500).send({msg:`Lo sentimos ocurrió un error al obtener los Vehículos en garantía del periodo ${moment(dateInit).format('DD-MM-YYYY')} a ${moment(dateFin).format('DD-MM-YYYY')}`, err:err})
        if(vins && vins.length>0){
            let data=[]
            for(let i=0; i<vins.length; i++){
                data.push({
                    use:vins[i].use,
                    retention:0,
                    retentionSales:0,
                    tickets:0,
                    ticketsSales:0,
                    units:0,
                    dealers:[]
                })
                for(let j=0; j<vins[i].dealers.length; j++){
                    if(vins[i].dealers[j].cl && vins[i].dealers[j].cl.length>0){
                        data[i].dealers.push({
                            cl:vins[i].dealers[j].cl,
                            ab:'',
                            dealer:'',
                            retention:0,
                            retentionSales:0,
                            units: Math.round(vins[i].dealers[j].units) ,
                            tickets:0,
                            ticketsSales:0
                        })
                        data[i].units += Math.round(vins[i].dealers[j].units);
                    }

                }
                for(let k=0; k<ticketResult.length; k++){
                    if(ticketResult[k].use == data[i].use){
                        for(let l=0; l<data[i].dealers.length; ++l){
                            for(let m=0; m<ticketResult[k].dealers.length; m++){
                                if(data[i].dealers[l].cl == ticketResult[k].dealers[m].cl){
                                    data[i].dealers[l].tickets = ticketResult[k].dealers[m].units;
                                    data[i].tickets += ticketResult[k].dealers[m].units;
                                    if(data[i].dealers[l].units >0){
                                        data[i].dealers[l].retention = Math.round( data[i].dealers[l].tickets / data[i].dealers[l].units * 10000) / 100
                                    }
                                }
                            }
                        }
                    }
                }
                for(let k=0; k<ticketResultSales.length; k++){
                    if(ticketResultSales[k].use == data[i].use){
                        for(let l=0; l<data[i].dealers.length; ++l){
                            for(let m=0; m<ticketResultSales[k].dealers.length; m++){
                                if(data[i].dealers[l].cl == ticketResultSales[k].dealers[m].cl){
                                    data[i].dealers[l].ticketsSales = ticketResultSales[k].dealers[m].units;
                                    data[i].ticketsSales += ticketResultSales[k].dealers[m].units;
                                    if(data[i].dealers[l].units >0){
                                        data[i].dealers[l].retentionSales = Math.round( data[i].dealers[l].ticketsSales / data[i].dealers[l].units * 10000) / 100
                                    }
                                }
                            }
                        }
                    }
                }
            }
            for(let i of data){
                for(let j of i.dealers){
                    for(let k of dealersData){
                        if(k.cl == j.cl){
                            j.ab = k.av;
                            j.dealer = k.dealer
                        }
                    }
                }
                i.retention = Math.round(i.tickets / i.units * 100)
            }
            switch(orderBy){
                case 'name':
                    for(let i of data){
                        i.dealers.sort((a,b)=>{
                            if(a.ab > b.ab){
                                return 1
                            }
                            if(a.ab > b.ab){
                                return -1
                            }
                            return -1;
                        })
                    }
                break;
                case 'tickets':
                    for(let i of data){
                        i.dealers.sort((a,b)=>{
                            if(a.tickets < b.tickets){
                                return 1
                            }
                            if(a.tickets < b.tickets){
                                return -1
                            }
                            return -1;
                        })
                    }
                break;
                case 'retention':
                    for(let i of data){
                        i.dealers.sort((a,b)=>{
                            if(a.retention < b.retention){
                                return 1
                            }
                            if(a.retention < b.retention){
                                return -1
                            }
                            return -1;
                        })
                    }
                break;
                case 'units':
                    for(let i of data){
                        i.dealers.sort((a,b)=>{
                            if(a.units < b.units){
                                return 1
                            }
                            if(a.units < b.units){
                                return -1
                            }
                            return -1;
                        })
                    }
                break;
                case 'salesRetention':
                    for(let i of data){
                        i.dealers.sort((a,b)=>{
                            if(a.retentionSales < b.retentionSales){
                                return 1
                            }
                            if(a.retentionSales < b.retentionSales){
                                return -1
                            }
                            return -1;
                        })
                    }
                break;
            }

            res.status(200).send(data)

        } else {
            res.status(200).send({msg:`Lo sentimos no hay información disponible de ${moment(dateInit).format('DD-MM-YYYY')} a ${moment(dateFin).format('DD-MM-YYYY')}`})
        }
    })
}
// Retención Cálculo Corea => Retención general
function getTicketsTwoTimeOnYear(req, res, next){
    let dateInit = new Date(moment(req.body.dateIn, 'DD/MM/YYYY').format())
    let dateFin = new Date(moment(req.body.dateFin, 'DD/MM/YYYY').format())
    let use = req.body.use
    let types = []
    let dealers = req.body.dealers
    for(let i of typesToRetention){
        types.push( new RegExp(i))
    }
    Ticket.aggregate([
        { $match:{ dealer_cod:{ $in:dealers } }},
        { $match:{ use_type:use }},
        { $match:{ typeIn:{ $in:types } }},
        { $match:{ avgKmtMonth: { $exists:true, $ne:null  } }},
        { $match:{ date_init_warranty: { $exists:true, $ne:null  } }},
        { $match:{ monthsOnWay: { $exists:true, $gte:0  } }},
        { $match:{ use_type: { $exists:true, $ne:null  } }},
        { $match:{ bill_date:{ $lte:dateFin, $gte:dateInit } }},
        { $group:{
            _id:{ vin:"$vin", use:"$use_type", dealer_cod:"$dealer_cod" },
            dubs:{ $push:"$kilometers" },
            count:{$sum:1}
        }},
        { $match: { count:{ "$gt": 1 } }},
        { $group:{
            _id:{ dealer:"$_id.dealer_cod", use:"$_id.use"},
            count:{ $sum:1}
        }},
        { $group:{
            _id:"$_id.use",
            units:{ $sum:"$count"},
            dealers:{ $push:{
                cl:"$_id.dealer",
                units:"$count"
            }}
        }},
        { $project:{
            _id:0,
            use:"$_id",
            units:"$units",
            dealers:"$dealers"
        }}

    ], (err, result)=>{
        if(err) return res.status(500).send({message:`Error al consultar los dealers`, err:err})

        if(result && result.length>0){
            ticketResult = result;
            next();
        } else {
            res.status(200).send([])
        }

    })
}
//Retención Cálculo Corea => Retención de Clientes Propios
function getTicketsTwoTimeOnYearSales(req, res, next){
    let dateInit = new Date(moment(req.body.dateIn, 'DD/MM/YYYY').format())
    let dateFin = new Date(moment(req.body.dateFin, 'DD/MM/YYYY').format())
    let use = req.body.use
    let types = []
    // let dealers = req.body.dealers
    for(let i of typesToRetention){
        types.push( new RegExp(i))
    }
    Ticket.aggregate([
        { $match:{ use_type:use }},
        { $match:{ typeIn:{ $in:types } }},
        { $match:{ avgKmtMonth: { $exists:true, $ne:null  } }},
        { $match:{ date_init_warranty: { $exists:true, $ne:null  } }},
        { $match:{ monthsOnWay: { $exists:true, $gte:0  } }},
        { $match:{ use_type: { $exists:true, $ne:null  } }},
        { $match:{ bill_date:{ $lte:dateFin, $gte:dateInit } }},
        { $group:{
            _id:{ vin:"$vin", use:"$use_type", dealer_cod:"$dealer_sales", dealer:"$dealer_cod" },
            dubs:{ $push:"$kilometers" },
            count:{$sum:{ $cond:[ { $eq:["$dealer_sales", "$dealer_cod"] }, 1, 0 ] }}
        }},
        { $match: { count:{ "$gt": 1 } }},
        { $group:{
            _id:{ dealer:"$_id.dealer_cod", use:"$_id.use"},
            count:{ $sum:1}
        }},
        { $group:{
            _id:"$_id.use",
            units:{ $sum:"$count"},
            dealers:{ $push:{
                cl:"$_id.dealer",
                units:"$count"
            }}
        }},
        { $project:{
            _id:0,
            use:"$_id",
            units:"$units",
            dealers:"$dealers"
        }}

    ], (err, result)=>{
        if(err) return res.status(500).send({message:`Error al consultar los dealers`, err:err})

        if(result && result.length>0){
            ticketResultSales = result;
            next();
        } else {
            res.status(200).send([])
        }

    })
}

//Get all models
function getModels(req, res, next){
    Models.aggregate([
        { $group:{
            _id:{ model:"$model", vin:"$sixDigit"}
        }},
        { $group:{
            _id:"$_id.model",
            vins:{ $push:{
                vin:"$_id.vin"
            }}
        }},
        { $project:{
            _id:0,
            model:"$_id",
            vins:"$vins"
        }}
    ], (err, result)=>{
        if(err) return res.status(500).send({msg:`Lo sentimos ocurrió un error al obtener los Vehículos en garantía del periodo ${moment(dateInit).format('DD-MM-YYYY')} a ${moment(dateFin).format('DD-MM-YYYY')}`, err:err})
        models = result;
        next()
    })
}

//Get all vehicle on operation according at date range
function getUIWByDateModel(req, res, next){
    let dateInit = new Date(moment( req.body.dateIn, 'DD/MM/YYYY').format())
    let dateFin = new Date(moment( req.body.dateFin, 'DD/MM/YYYY').format())
    let dealers = req.body.dealers
    Vin.aggregate([
        { $match:{ dealer_cod:{ $in:dealers } }},
        { $match:{ date_init_warranty:{ $lte:dateInit } }},
        { $group:{
            _id:{ use:"$use_type", vin:{ $substr:["$vin", 0, 6] } },
            total:{ $sum:{ $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 0 ] },
            1,
            { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 1 ] },
                0.99,
                { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 2 ] },
                    0.97,
                    { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 3 ] },
                        0.94,
                        { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 4 ] },
                            0.88,
                            { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 5 ] },
                                0.8,
                                { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 6 ] },
                                    0.69,
                                    { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 7 ] },
                                        0.56,
                                        { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 8 ] },
                                            0.44,
                                            { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 9 ] },
                                                0.32,
                                                { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 10 ] },
                                                    0.21,
                                                    { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 11 ] },
                                                        0.14,
                                                        { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 12 ] },
                                                            0.06,
                                                            { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 13 ] },
                                                                0,
                                                                { $cond:[ { $gt:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 13 ] },
                                                                    0,
                                                                    0
                                                                ] }
                                                            ] }
                                                        ] }
                                                    ] }
                                                ] }
                                            ] }
                                        ] }
                                    ] }
                                ] }
                            ] }
                        ] }
                    ] }
                ] }

             ] }
        ] } }
        }},
        { $group:{
            _id:"$_id.use",
            units:{ $sum:"$total"},
            vins:{ $push:{
                vin:"$_id.vin",
                units:{ $sum:"$total"}
            }}
        }},
        { $project:{
            _id:0,
            use:"$_id",
            units:"$units",
            vins:"$vins"
        }}

    ], (err, vins)=>{
        if(err) return res.status(500).send({msg:'Ocurrió un error al obtener las unidades en garantí', err:err})
        VIOByModel = vins;
        next()
    })
}
//Get all tickets that haven "MTO" in the typeIn field
function getTicketByModel(req, res, next){
    let computation = req.body.computation;
    let dateInit = new Date(moment(req.body.dateIn, 'DD/MM/YYYY').format())
    let dateFin = new Date(moment(req.body.dateFin, 'DD/MM/YYYY').format())
    let dealers = req.body.dealers
    let types = []
    let typesToMTOFun = []
    for(let i of typesToRetention){
        types.push( new RegExp(i))
    }
    if(computation==1){
        for(let i of typesToMTO){
            typesToMTOFun.push( new RegExp(i))
        }
        Ticket.aggregate([
            { $match:{ dealer_cod:{ $in:dealers } }},
            { $match:{ typeIn:{ $in:typesToMTOFun } }},
            { $match:{ avgKmtMonth: { $exists:true, $ne:null  } }},
            { $match:{ date_init_warranty: { $exists:true, $ne:null  } }},
            { $match:{ monthsOnWay: { $exists:true, $ne:0  } }},
            { $match:{ use_type: { $exists:true, $ne:null  } }},
            { $match:{ bill_date:{ $lte:dateFin, $gte:dateInit } }},
            { $group:{
                _id:{ vin:{ $substr:["$vin", 0, 6 ]}, use:"$use_type" },
                count:{ $sum:1}
            }},
            { $group:{
                _id:"$_id.use",
                units:{ $sum:"$count"},
                vins:{ $push:{
                    vin:"$_id.vin",
                    unit:"$count"
                 } }
            }},
            { $project:{
                _id:0,
                use:"$_id",
                units:"$units",
                vins:"$vins"
            }}

        ], (err, result)=>{
            if(err) return res.status(500).send({msg:`Lo sentimos ocurrió un error al obtener los Vehículos en garantía del periodo ${moment(dateInit).format('DD-MM-YYYY')} a ${moment(dateFin).format('DD-MM-YYYY')}`, err:err})
            TICKETS = result;
            next()
        })
    } else if (computation==2) {
        // Programar el segundo modo de obtener los datos
        Ticket.aggregate([
            { $match:{ dealer_cod:{ $in:dealers } }},
            { $match:{ typeIn:{ $in:types } }},
            { $match:{ avgKmtMonth: { $exists:true, $ne:null  } }},
            { $match:{ date_init_warranty: { $exists:true, $ne:null  } }},
            { $match:{ monthsOnWay: { $exists:true, $ne:0  } }},
            { $match:{ use_type: { $exists:true, $ne:null  } }},
            { $match: { bill_date:{ $lte:dateFin, $gte:dateInit } }},
            { $group:{
                _id:{ vin:"$vin", type:"$use_type" },
                dubs:{ $push:"$typeIn" },
                count:{$sum:1}
            }},
            { $match: { count:{ "$gt": 1 } }},
            { $project:{
                _id:0,
                vin:"$_id.vin",
                count:{ $sum: 1},
                use_type:"$_id.type"
            }},
            { $group:{
                _id:{ vin:{ $substr:["$vin", 0, 6 ]}, use:"$use_type" },
                count:{ $sum:"$count"}
            }},
            { $group:{
                _id:"$_id.use",
                units:{ $sum:"$count"},
                vins:{ $push:{
                    vin:"$_id.vin",
                    unit:"$count"
                 } }
            }},
            { $project:{
                _id:0,
                use:"$_id",
                units:"$units",
                vins:"$vins"
            }}


        ], (err, result)=>{
            if(err) return res.status(500).send({msg:'Ocurrió un error al obtenet los clientes con mas de dos entradas al año', err:err})
            TICKETS = result;

            next()
        })
        // res.status(200).send({msg:'>:V  Aún no has programado la opciòn 2  Chamaco perro'})
    }

}

function RetentetionByModel(req, res){

    let data = []
    let order = req.body.order
    for(let i=0; i<TICKETS.length; i++){
        data.push({
            use: TICKETS[i].use,
            units: TICKETS[i].units,
            models:[]
        })
        for(let j=0; j<models.length; j++){
            data[i].models.push({
                model:models[j].model,
                units:0,
                tickets:0,
                vins:[]
            })
            for(let k=0; k<models[j].vins.length; k++){
                data[i].models[j].vins.push({
                    vin:models[j].vins[k].vin,
                    units:0,
                    tickets:0,
                    retention:0
                })
                for(let l=0; l<TICKETS[i].vins.length; l++){
                    if(data[i].models[j].vins[k].vin == TICKETS[i].vins[l].vin){
                        data[i].models[j].vins[k].tickets = TICKETS[i].vins[l].unit;
                        data[i].models[j].tickets += TICKETS[i].vins[l].unit;
                    }
                }
                for(let l=0; l<VIOByModel.length; l++){
                    if(VIOByModel[l].use == data[i].use){
                        for(let m=0; m<VIOByModel[l].vins.length; m++){
                            if( data[i].models[j].vins[k].vin == VIOByModel[l].vins[m].vin){
                                data[i].models[j].vins[k].units = Math.round(VIOByModel[l].vins[m].units);
                                data[i].models[j].units += Math.round(VIOByModel[l].vins[m].units);
                            }
                        }
                        if(data[i].models[j].units == 0){
                            data[i].models[j].retention = 0
                        } else {
                            data[i].models[j].retention = Math.round( data[i].models[j].tickets / data[i].models[j].units * 10000 ) /100
                        }
                    }
                }
            }
        }
    }
    data.sort((a,b)=>{
        if(a.use > b.use){
            return 1
        }
        if(a.use > b.use){
            return -1
        }
        return -1;
    })

    if(order == 'model'){
        for(let i of data){
            i.models.sort((a,b)=>{
                if(a.model > b.model){
                    return 1
                }
                if(a.model > b.model){
                    return -1
                }
                return -1;
            })
        }
    } else if(order == 'units') {
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
    } else if (order == 'tickets'){
        for(let i of data){
            i.models.sort((a,b)=>{
                if(a.tickets < b.tickets){
                    return 1
                }
                if(a.tickets < b.tickets){
                    return -1
                }
                return -1;
            })
        }
    }

    res.status(200).send(data)
    // res.status(200).send(VIOByModel)


}

function getDistinctUse(req, res){

    Vin.distinct("use_type", (err, use)=>{
        if(err) return res.status(500).send({msg:'Error al obtener los tipos de uso', err:err})
        res.status(200).send(use)
    })
}

function typeInByKilometers(req, res){
    let type = new RegExp('MTO')
    let dateIni = new Date(req.body.dateInit);
    let dateEnd = new Date(req.body.dateEnd);
    let dealer = req.body.dealer;
    let model = []
    for(let i of req.body.model){
        model.push( new RegExp(i))
    }
    let use = req.body.use
    Ticket.aggregate([
        { $match:{ bill_date:{ $gte:dateIni, $lte:dateEnd } }},
        { $match:{ dealer_cod:{ $in:dealer } }},
        { $match:{ vin:{ $in:model } }},
        { $match:{ use_type:use }},
        { $match:{ typeIn:type } },
        { $group: {
            _id:{ typeIn:{ $cond:[
                { $lte:[ "$kilometers", 2500]  },
                "MTO_1",
                { $cond:[
                    { $and:[{$gte:[ "$kilometers", 2500]}, {$lt:[ "$kilometers", 7500]}] },
                    "MTO_5",
                    { $cond:[
                        { $and:[ { $gte:[ "$kilometers", 7500]}, {$lt:[ "$kilometers", 12500] } ] },
                        "MTO_10",
                        { $cond:[ { $and:[ { $gte:[ "$kilometers", 12500]}, {$lt:[ "$kilometers", 17500] } ] },
                        "MTO_15",
                        { $cond:[
                            { $and:[ { $gte:["$kilometers", 17500]}, { $lt:["$kilometers", 22500]} ]},
                            "MTO_20",
                            { $cond:[
                                { $and:[ { $gte:["$kilometers", 22500]}, { $lt:["$kilometers", 27500]} ]},
                                "MTO_25",
                                { $cond:[
                                    { $and:[ { $gte:["$kilometers", 27500]}, { $lt:["$kilometers", 32500]} ]},
                                    "MTO_30",
                                    { $cond:[
                                        { $and:[ { $gte:["$kilometers", 32500]}, { $lt:["$kilometers", 37500]} ]},
                                        "MTO_35",
                                        { $cond:[
                                            { $and:[ { $gte:["$kilometers", 37500]}, { $lt:["$kilometers", 42500]} ]},
                                            "MTO_40",
                                            { $cond:[
                                                { $and:[ { $gte:["$kilometers", 42500]}, { $lt:["$kilometers", 47500]} ]},
                                                "MTO_45",
                                                { $cond:[
                                                    { $and:[ { $gte:["$kilometers", 47500]}, { $lt:["$kilometers", 52500]} ]},
                                                    "MTO_50",
                                                    { $cond:[
                                                        { $and:[ { $gte:["$kilometers", 52500]}, { $lt:["$kilometers", 57500]} ]},
                                                        "MTO_55",
                                                        { $cond:[
                                                            { $and:[ { $gte:["$kilometers", 57500]}, { $lt:["$kilometers", 62500]} ]},
                                                            "MTO_60",
                                                            { $cond:[
                                                                { $and:[ { $gte:["$kilometers", 62500]}, { $lt:["$kilometers", 67500]} ]},
                                                                "MTO_65",
                                                                { $cond:[
                                                                    { $and:[ { $gte:["$kilometers", 67500]}, { $lt:["$kilometers", 72500]} ]},
                                                                    "MTO_70",
                                                                    { $cond:[
                                                                        { $and:[ { $gte:["$kilometers", 72500]}, { $lt:["$kilometers", 77500]} ]},
                                                                        "MTO_75",
                                                                        { $cond:[
                                                                            { $and:[ { $gt:["$kilometers", 77500]}, { $lt:["$kilometers", 82500]} ]},
                                                                            "MTO_80",
                                                                            { $cond:[
                                                                                { $and:[ { $gte:["$kilometers", 82500]}, { $lt:["$kilometers", 87500]} ]},
                                                                                "MTO_85",
                                                                                { $cond:[
                                                                                    { $and:[ { $gte:["$kilometers", 87500]}, { $lt:["$kilometers", 92500]} ]},
                                                                                    "MTO_90",
                                                                                    { $cond:[
                                                                                        { $and:[ { $gte:["$kilometers", 92500]}, { $lt:["$kilometers", 97500]} ]},
                                                                                        "MTO_95",
                                                                                        { $cond:[
                                                                                            { $and:[ { $gte:["$kilometers", 97500]}, { $lt:["$kilometers", 102500]} ]},
                                                                                            "MTO_100",
                                                                                            { $cond:[
                                                                                                { $and:[ { $gte:["$kilometers", 102500]}, { $lt:["$kilometers", 107500]} ]},
                                                                                                "MTO_105",
                                                                                                { $cond:[
                                                                                                    { $and:[ { $gte:["$kilometers", 107500]}, { $lt:["$kilometers", 112500]} ]},
                                                                                                    "MTO_110",
                                                                                                    { $cond:[
                                                                                                        { $and:[ { $gte:["$kilometers", 112500]}, { $lt:["$kilometers", 117500]} ]},
                                                                                                        "MTO_115",
                                                                                                        { $cond:[
                                                                                                            { $and:[ { $gte:["$kilometers", 117500]}, { $lt:["$kilometers", 122500]} ]},
                                                                                                            "MTO_120",
                                                                                                            { $cond:[
                                                                                                                { $and:[ { $gte:["$kilometers", 122500]}, { $lt:["$kilometers", 127500]} ]},
                                                                                                                "MTO_125",
                                                                                                                { $cond:[
                                                                                                                    { $and:[ { $gte:["$kilometers", 127500]}, { $lt:["$kilometers", 132500]} ]},
                                                                                                                    "MTO_130",
                                                                                                                    { $cond:[
                                                                                                                        { $and:[ { $gte:["$kilometers", 132500]}, { $lt:["$kilometers", 137500]} ]},
                                                                                                                        "MTO_135",
                                                                                                                        { $cond:[
                                                                                                                            { $and:[ { $gte:["$kilometers", 137500]}, { $lt:["$kilometers", 142500]} ]},
                                                                                                                            "MTO_140",
                                                                                                                            { $cond:[
                                                                                                                                { $and:[ { $gte:["$kilometers", 142500]}, { $lt:["$kilometers", 147500]} ]},
                                                                                                                                "MTO_145",
                                                                                                                                { $cond:[
                                                                                                                                    { $and:[ { $gte:["$kilometers", 147500]}, { $lt:["$kilometers", 152500]} ]},
                                                                                                                                    "MTO_150",
                                                                                                                                    { $cond:[
                                                                                                                                        { $and:[ { $gte:["$kilometers", 152500]} ]},
                                                                                                                                        "> MTO_150",
                                                                                                                                        "OTROS"
                                                                                                                                    ] }
                                                                                                                                ] }
                                                                                                                            ] }
                                                                                                                        ] }
                                                                                                                    ] }
                                                                                                                ] }
                                                                                                            ] }
                                                                                                        ] }
                                                                                                    ] }
                                                                                                ] }
                                                                                            ] }
                                                                                        ] }
                                                                                    ] }
                                                                                ] }
                                                                            ] }
                                                                        ] }
                                                                    ] }
                                                                ] }
                                                            ] }
                                                        ] }
                                                    ] }
                                                ] }
                                            ] }
                                        ] }
                                    ] }
                                ] }
                            ] }
                        ] }
                        ] }
                    ] },

                ]}
            ] } },
            total:{ $sum:1 },
            avg:{ $avg:"$kilometers" }
        } },
        { $project:{
            _id:0,
            typeIn:"$_id.typeIn",
            total:"$total",
            avg:"$avg"
        } },
        { $sort:{ avg:1 }}
    ], (err, tickets)=>{
        if(err) return res.status(500).send({msg:'Error al obtener las entradas por tipo de entrada', err:err})
        res.status(200).send(tickets)
    })
}


// Clientes que entraron al menos 2 veces en el año y los costos de las reparaciones fueron asumidas por el cliente
// Clasificadas por tipo de uso y por los años de operación de cada vehículo, tomados a partir de la fecha de inicio de garantía
function getTicketByOperationYear(req, res, next){
    let dateInit = new Date(moment(req.body.dateInit).format())
    let dateFin = new Date(moment(req.body.dateEnd).format())
    let dealer = req.body.dealer;
    let types = []
    for(let i of typesNoRetention){
        types.push( new RegExp(i))
    }
    let model = []
    for(let i of req.body.model){
        model.push( new RegExp(i))
    }
    Ticket.aggregate([
        { $match:{ typeIn:{ $nin:types } }},
        { $match:{ avgKmtMonth: { $exists:true, $ne:null  } }},
        { $match:{ date_init_warranty: { $exists:true, $ne:null  } }},
        { $match:{ monthsOnWay: { $exists:true, $ne:0  } }},
        { $match:{ use_type: { $exists:true, $ne:null  } }},
        { $match:{ bill_date:{ $lte:dateFin, $gte:dateInit } }},
        { $match:{ dealer_cod:{ $in:dealer } }},
        { $match:{ vin:{ $in:model } }},
        { $group:{
            _id:{ vin:"$vin", use:"$use_type", yearOnway:{ $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } },
            dubs:{ $push:"$typeIn" },
            count:{$sum:1}
        }},
        { $match: { count:{ "$gt": 1 } }},
        { $group:{
            _id:{yearOnway:"$_id.yearOnway", use:"$_id.use", },
            count:{ $sum:1}
        }},
        { $sort: { "_id.yearOnway": 1 }},
        { $group:{
            _id:"$_id.use",
            units:{ $sum:"$count"},
            years:{ $push:{
                year:"$_id.yearOnway",
                units:{ $sum:"$count"}
            }}
        }}

    ], (err, result)=>{
        if(err) return res.status(500).send({message:`Error al consultar los tickets`, err:err})

        if(result && result.length>0){
            ticketResult = result;
            next();
        } else {
            res.status(200).send([])
        }

    })
}

function getTicketByOperationYearSales(req, res, next){
    let dateInit = new Date(moment(req.body.dateInit).format())
    let dateFin = new Date(moment(req.body.dateEnd).format())
    let dealer = req.body.dealer;
    let types = []
    for(let i of typesNoRetention){
        types.push( new RegExp(i))
    }
    let model = []
    for(let i of req.body.model){
        model.push( new RegExp(i))
    }
    Ticket.aggregate([
        { $match:{ typeIn:{ $nin:types } }},
        { $match:{ avgKmtMonth: { $exists:true, $ne:null  } }},
        { $match:{ date_init_warranty: { $exists:true, $ne:null  } }},
        //{ $match:{ monthsOnWay: { $exists:true, $ne:0  } }},
        { $match:{ use_type: { $exists:true, $ne:null  } }},
        { $match:{ bill_date:{ $lte:dateFin, $gte:dateInit } }},
        { $match:{ dealer_cod:{ $in:dealer } }},
        { $match:{ dealer_sales:{ $in:dealer } }},
        { $match:{ vin:{ $in:model } }},
        { $group:{
            _id:{
                    vin:"$vin",
                    use:"$use_type",
                    yearOnway:{ $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } }
                },
            dubs:{ $push:"$typeIn" },
            count:{$sum:1}
        }},
        { $match: { count:{ "$gt": 1 } }},
        { $group:{
            _id:{yearOnway:"$_id.yearOnway", use:"$_id.use", },
            count:{ $sum:1}
        }},
        { $sort: { "_id.yearOnway": 1 }},
        { $group:{
            _id:"$_id.use",
            units:{ $sum:"$count"},
            years:{ $push:{
                year:"$_id.yearOnway",
                units:{ $sum:"$count"}
            }}
        }}

    ], (err, result)=>{
        if(err) return res.status(500).send({message:`Error al consultar las entradas`, err:err})

        if(result && result.length>0){
            ticketResultSales = result;
            next();
        } else {
            res.status(200).send([])
        }

    })
}
// Clasificación de los vehículos de acuerdo a los años en operación y al tipo de uso
// Implementar filtros de Distribuidor
// Es necesario definir la fecha final con la que será comparada el tiempo en operación y debería ser
// la fecha final del rango de las entradas
function getVIOByYearOperation(req, res, next){
    let dateInit = new Date(moment(req.body.dateInit).format());
    let dateFin = new Date(moment(req.body.dateEnd).format());
    let dealer = req.body.dealer;
    let model = [];
    for(let i of req.body.model){
        model.push( new RegExp(i))
    }
    Vin.aggregate([
        { $match:{ date_init_warranty:{ $exists:true, $ne:null } }},
        { $match:{ date_init_warranty:{ $lte:dateInit } }},
        { $match:{ use_type:{ $exists:true, $ne:null } }},
        { $match:{ dealer_cod:{ $in:dealer } }},
        { $match:{ vin:{ $in:model } }},
        { $group:{
            _id:{ use:"$use_type", years:{ $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } }},
            count:{ $sum: { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 0 ] },
                                    1,
                                    { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 1 ] },
                                        0.99,
                                        { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 2 ] },
                                            0.97,
                                            { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 3 ] },
                                                0.94,
                                                { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 4 ] },
                                                    0.88,
                                                    { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 5 ] },
                                                        0.8,
                                                        { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 6 ] },
                                                            0.69,
                                                            { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 7 ] },
                                                                0.56,
                                                                { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 8 ] },
                                                                    0.44,
                                                                    { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 9 ] },
                                                                        0.32,
                                                                        { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 10 ] },
                                                                            0.21,
                                                                            { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 11 ] },
                                                                                0.14,
                                                                                { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 12 ] },
                                                                                    0.06,
                                                                                    { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 13 ] },
                                                                                        0,
                                                                                        { $cond:[ { $gt:[ { $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 13 ] },
                                                                                            0,
                                                                                            0
                                                                                        ] }
                                                                                    ] }
                                                                                ] }
                                                                            ] }
                                                                        ] }
                                                                    ] }
                                                                ] }
                                                            ] }
                                                        ] }
                                                    ] }
                                                ] }
                                            ] }
                                        ] }

                                     ] }
                                ]} }
        }},
        { $sort:{ "_id.years":1 }},
        {
            $group:{
                _id:"$_id.use",
                units:{ $sum:"$count"},
                years:{ $push:{
                    year:"$_id.years",
                    units:{ $sum:"$count"}
                } }
            }
        }
    ], (err, vins)=>{
        if(err) return res.status(500).send({msg:'Error al obtener los vehiculos en operacion por años de operación', err:err})
        unitsResult = vins;
        next()

    })
}

// Funcion que combina los resultados de las Entradas y el parque "getRetentionByYear" VS "getVIOByYearOperation"
function getRetentionByYearOperation(req, res){
    let data = []
    if(unitsResult && unitsResult.length > 0 && ticketResult && ticketResult.length> 0 && ticketResultSales && ticketResultSales.length>0){
        for(let i=0;  i< unitsResult.length; i++){
            data.push({
                use:unitsResult[i]._id,
                uio:unitsResult[i].units,
                years:[]
            })
            for(let j=0; j<unitsResult[i].years.length; j++){
                data[i].years.push({
                    year: unitsResult[i].years[j].year,
                    uio: Math.round(unitsResult[i].years[j].units),
                    tickets:0,
                    ticketsSales:0,
                    retention:0,
                    retentionSales:0
                })
                for(let k=0; k<ticketResult.length; k++){
                    if(ticketResult[k]._id == data[i].use){
                        for(let l=0; l<ticketResult[k].years.length; l++){
                            if(data[i].years[j].year == ticketResult[k].years[l].year){
                                data[i].years[j].tickets = ticketResult[k].years[l].units
                                data[i].years[j].retention = Math.round( ticketResult[k].years[l].units / data[i].years[j].uio * 10000 ) / 100
                            }
                        }
                    }

                }
                for(let k=0; k<ticketResultSales.length; k++){
                    if(ticketResultSales[k]._id == data[i].use){
                        for(let l=0; l<ticketResultSales[k].years.length; l++){
                            if(data[i].years[j].year == ticketResultSales[k].years[l].year){
                                data[i].years[j].ticketsSales = ticketResultSales[k].years[l].units
                                data[i].years[j].retentionSales = Math.round( ticketResultSales[k].years[l].units / data[i].years[j].uio * 10000 ) / 100
                            }
                        }
                    }
                }
            }

        }
        res.status(200).send(data)
    } else {
        return res.status(200).send([])
    }
}



// Cálculo de la retención VIN a VIN
    // 1. Cálculo de los años de operación de todos los VIN
    
    let totalVIN = 0;
    let retenidos = 0;
    let noretenidos = 0;
    
    function getYearOperationByVIN(){
        let dateInitCLient = '';
        let dateFinCLient = '';
        
        dateInitCLient = moment().subtract(1,'year').format('YYYYMMDD')
        dateFinCLient = moment().format('YYYYMMDD') 
        
        let typeIn = [
            /CCLI/,
            /RCOM/, 
            /RSEN/, 
            /ACCI/,
            /MTO/, 
            /MANT/]
            
        // Fechas del Estudio
        let dateInit = new Date( moment(dateInitCLient, 'YYYYMMDD').format())
        let dateFin = new Date( moment(dateFinCLient, 'YYYYMMDD').format());

        // Date 7 years ago: Por casusa de la memoria del sistema se limita la fecha del VIO hasta siete años atrás
        let dateLimit = new Date( moment(dateInit).subtract(7, 'years').format() )

        Vin.aggregate( [
            { $match:{ date_init_warranty:{ $ne:null, $exists:true } }},
            // Por memoria se restringe la información a los últimos 7 años
            { $match:{ date_init_warranty:{ $gte:dateLimit}}},
            { $match:{ dealer_cod:{ $ne:null } }},
            { $project:{
                _id:0,
                vin:"$vin",
                dealer:"$dealer_cod",
                init_warranty:"$date_init_warranty",
                monthsOnway:{ $trunc: { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30]} ] } },
                yearsOnway:{ $trunc:{ $divide:[ { $divide:[ {$subtract:[ dateFin, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30]} ] }, 12 ] } },
                tickets:{ $sum:0 },
                retention:{ $sum:0 },
            }},
            { $match:{ "monthsOnway":{ $gte:6 } }}

        ], (error, vin)=>{
            if(error) return console.log(error)

            // Si encuentra información
            
            if(vin && vin.length>0){
                
                console.log({
                    TotalVins:vin.length,
                    fechaInicio:dateInit,
                    fechaFinal:dateFin,
                    distribuidor:vin.dealer,
                    message:'Unidades disponibles para análisis',
                    dataExample:vin[0]
                })

                console.log('Iniciando conteo...')
                totalVIN = vin.length;
                
                if(totalVIN>0){
                    saveHistoryVin(vin, dateInit, dateFin, typeIn);
                } else {
                    process.stdout.write(`Proceso Terminado`)
                }
                
            } else {
                
                console.log({
                    TotalVins:vin.length,
                    fechaInicio:dateInit,
                    fechaFinal:dateFin,
                    message:'No se encontraron unidades para el análisis'
                })
            }
        } )
    }

    // setTimeout( function(){
    //     getYearOperationByVIN()
    // }, 2592000000 )
    //getYearOperationByVIN()

    function saveHistoryVin(vin, dateInit, dateFin, typeIn){
        
        let item = vin.pop();
        Ticket.find({
            bill_date:{ $gte:dateInit, $lte:dateFin },
            typeIn:{ $in:typeIn },
            vin:item.vin
        }, (ticketError, tikectResult)=>{
            if(ticketError) console.log(`Error al buscar las entradas del VIN ${item.vin}`)
            if(tikectResult && tikectResult.length>1){
                
                
                item.retention = 1;
                item.tickets = tikectResult.length;
                const vinToSave = new VinRetention(item);
                
                    
                    vinToSave.save( (error)=>{
                        if(error && error.code == 11000){
                            VinRetention.findOneAndUpdate({vin:vinToSave.vin}, vinToSave, (err, success)=>{
                                totalVIN-- // reducir Contador
                                retenidos +=1;
                                
                                process.stdout.cursorTo(0);
                                process.stdout.write(`Clientes retenidos: ${retenidos} vs No retenidos ${noretenidos}`);
                                if(totalVIN>0){
                                    
                                    saveHistoryVin(vin, dateInit, dateFin, typeIn)
                                } else {
                                    process.stdout.write(`Termiando desde funcion saveHistory`)
                                }
                            })
                        } else {
                            totalVIN-- // reducir Contador
                            if(totalVIN>0){
                                saveHistoryVin(vin, dateInit, dateFin, typeIn)
                            } else {
                                process.stdout.write(`Termiando desde funcion saveHistory`)
                            }
                        }
                        totalVIN-- // reducir Contador
                        retenidos +=1;
                        
                        process.stdout.cursorTo(0);
                        process.stdout.write(`Clientes retenidos: ${retenidos} vs No retenidos ${noretenidos}`);
                        if(totalVIN>0){
                            saveHistoryVin(vin, dateInit, dateFin, typeIn)
                        } else {
                            process.stdout.write(`Termiando desde funcion saveHistory`)
                        }
                    } )                
                
            } else {
                

                item.retention = 0;
                const vinToSave = new VinRetention(item);
                
                    vinToSave.save( (error)=>{
                        
                        if(error && error.code == 11000){
                            VinRetention.findOneAndUpdate({vin:vinToSave.vin}, vinToSave, (err, success)=>{
                                totalVIN-- // reducir Contador
                                noretenidos +=1;
                                
                                process.stdout.cursorTo(0);
                                process.stdout.write(`Clientes retenidos: ${retenidos} vs No retenidos ${noretenidos}`);
                                if(totalVIN>0){
                                    saveHistoryVin(vin, dateInit, dateFin, typeIn)
                                } else {
                                    process.stdout.write(`Termiando desde funcion saveHistory`)
                                }
                            })
                        }
                        totalVIN-- // reducir Contador
                        noretenidos +=1;
                        
                        process.stdout.cursorTo(0);
                        process.stdout.write(`Clientes retenidos: ${retenidos} vs No retenidos ${noretenidos}`);
                        if(totalVIN>0){
                            saveHistoryVin(vin, dateInit, dateFin, typeIn)
                        } else {
                            process.stdout.write(`Termiando desde funcion saveHistory`)
                        }
                    } )
                    
            }
        })
    }

    // Funcion para calculo de la retención vin a vin;
    // getYearOperationByVIN();

    function getDataRetention(req, res){
        VinRetention.aggregate([
            { $group:{
                _id:{ dealer:"$dealer" },
                retenidos:{ $sum:"$retention" },
                total:{ $sum:1 },
            } },
            { $project:{
                _id:0,
                dealer:"$_id.dealer",
                retenidos:"$retenidos",
                clientes:"$total",
                retencionGeneral:{ $divide:[ "$retenidos", "$total" ] },
                retencionGeneralPorcentaje:{ $divide:[ { $trunc:[ { $multiply:[{ $divide:[ "$retenidos", "$total" ] }, 10000 ]} ] }, 100 ] },

            }}
        ], (error, data)=>{
            if(error) return res.status(500).send({error:error})
            if(data && data.length>0){
                let totalClientes = 0;
                let retenidos = 0;
                data.map( (dealer)=>{
                    totalClientes += dealer.clientes;
                    retenidos += dealer.retenidos;
                } )
                res.status(200).send({
                    totalClientes : totalClientes,
                    retenidos : retenidos,
                    retencionGeneral : retenidos/totalClientes,
                    retencionGeneralPorcentaje : Math.round((retenidos/totalClientes)*10000)/100,
                    data : data
                })
            }
            
        })
    }

    function getDataRetentionByYear(req, res){
        VinRetention.aggregate([
            { $group:{
                _id:{ years:"$yearsOnway" },
                total:{ $sum : 1 },
                retenidos:{ $sum:"$retention" }
            }},
            { $project:{
                _id:0,
                years:"$_id.years",
                retenidos:"$retenidos",
                clientes:"$total",
                retencionGeneral:{ $divide:[ "$retenidos", "$total" ] },
                retencionGeneralPorcentaje:{ $divide:[ { $trunc:[ { $multiply:[{ $divide:[ "$retenidos", "$total" ] }, 10000 ]} ] }, 100 ] },
            }},
            { $sort:{ year:1 }}
        ], (error, data)=>{
            if(error) return res.status(500).send({data:[], msg:'Ocurrio un error al obtener la retención por año de operación', status:500})
            res.status(200).send(data)
        })
    }

    function getDataRetentionByYearAndDealer(req, res){
        VinRetention.aggregate([
            { $group:{
                _id:{ years:"$yearsOnway", dealer:"$dealer" },
                total:{ $sum : 1 },
                retenidos:{ $sum:"$retention" }
            }},
            { $project:{
                _id:0,
                years:"$_id.years",
                distribuidor:"$_id.dealer",
                retenidos:"$retenidos",
                clientes:"$total",
                retencionGeneral:{ $divide:[ "$retenidos", "$total" ] },
                retencionGeneralPorcentaje:{ $divide:[ { $trunc:[ { $multiply:[{ $divide:[ "$retenidos", "$total" ] }, 10000 ]} ] }, 100 ] },
            }},
            { $sort:{ year:1 }}
        ], (error, data)=>{
            if(error) return res.status(500).send({data:[], msg:'Ocurrio un error al obtener la retención por año de operación', status:500})
            res.status(200).send(data)
        })
    }

module.exports = {
    getTicket,
    getTicketSales,
    getDealer,
    getUIWByDate,
    getTicketsTwoTimeOnYear,
    getTicketsTwoTimeOnYearSales,
    typeInByKilometers,
    getDistinctUse,
    getTicketByOperationYear,
    getTicketByOperationYearSales,
    getVIOByYearOperation,
    getRetentionByYearOperation,

    // Models
    getTicketByModel,
    getModels,
    getUIWByDateModel,
    RetentetionByModel,

    //Retención
    getDataRetention,
    getDataRetentionByYear,
    getDataRetentionByYearAndDealer
}