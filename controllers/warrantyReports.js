'use strict'

const mongoose = require('mongoose')
const moment = require('moment')
const ObjectId = mongoose.Types.ObjectId
const VIN = require('vehicle-identification-number')
const HolyDays = require('colombia-holidays');

const ASRW = require('../models/aftersales_report') // Reporte de Posventa Garantías
const Dealers = require('../models/dealer')
const Other = require('../models/others')
const Parts = require('../models/parts')
const Budget = require('../models/budget_warranty')
const PWA = require('../models/pwa')
const SRG = require('../models/srg')

const PWAPending = require('../models/pwa-pending')
const SRGPending = require('../models/srg-pending')

const DCSI = require('../models/dcsi')
const Tickets = require('../models/ticket')

let AllOthers = []
let OtherNoSB = [] //Terceros que no afectan el presupuesto
let AllParts = []
let PartsNoSB = [] // Partes que no afectan el presupuesto
let OthersReport = []
let dcsiAll = [] // DCSI
let ticketAll = [] // Entradas

let ConsumedDealer = [] //Consumos por dealer

//Get all Others, group by setBudget
function getOthersBySetBudget(req, res, next){
    Other.find({}, (err, others)=>{
        if(err) return res.status(200).send(err)
        AllOthers = others;
        next()
    })
}
// Get others than no set budget
function getOtherNoSetBusget(req, res, next){
    Other.aggregate([
        { $match:{ setBudget:false }},
        { $project:{
            id:"$_id",
            _id:0,
        }}
    ], (err, others)=>{
        if(err) return res.status(500).send(err)
        if(others){
            for(let i of others){
                OtherNoSB.push(i.id)
            }
            next()
        } else {
            next()
        }
        
    })
}

// Get Parts than not set budget
function getPartsNoSetBudget(req, res, next){
    Parts.find({other:{ $in:OtherNoSB }}, (err, parts)=>{
        if(err) return res.status(500).send(err)
        if(parts){
            for(let i of parts){
                PartsNoSB.push(i.name)
            }
            next()
        } else {
            next()
        }
    })
}

//Get all parts, by Other's Id
function getAllParts(req, res, next){
    Parts.aggregate([
        { $group:{
            _id:"$other",
            parts:{ $push:"$name" }
        }},
        { $project:{
            _id:0,
            other:"$_id",
            setBudget:[],
            name:[],
            parts:"$parts"
        }}
    ], (err, parts)=>{
        if(err) return res.status(500).send(err)
        if(parts && parts.length){
            for(let i of parts){
                for(let j of AllOthers){
                    if(i.other == j._id){
                        i.setBudget = j.setBudget;
                        i.name = j.name;
                    }
                }
            }
            AllParts = parts;
            next()
        }
        // res.status(200).send({AllOthers:AllOthers, parts:parts})
    })
    

}

// Get values by Other: group by date
function getValueByOthersGroupDate(req, res, next){
    OthersReport = []
    let len = AllParts.length;
    let indexI = 0;
    for(let i of AllParts){
        
        let parts = []
        for(let j of i.parts){
            parts.push( new RegExp(j) )
        }
        ASRW.aggregate([
            { $match:{ code_part:{ $in:parts } }},
            { $group:{
                _id:"$year_month_approval",
                value:{ $sum:"$total_value"}
            }},
            { $project:{
                _id:0,
                name:i.name,
                date:"$_id",
                value:"$value"
            }}
        ], (err, report)=>{
            if(err) return res.status(500).send(err)
            OthersReport.push(report)
            console.log('indexI: ', indexI)
            console.log('len: ', len)
            if(indexI == len-1 ){
                next()
            }
            indexI += 1;
        })
    }
}

function sendOthersReport(req, res){
    res.status(200).send(OthersReport)
}

// get values by cl
function getConsumed(req, res){
    let parts = [];
    for(let i of PartsNoSB){
        parts.push( new RegExp(i))
    }
    
    ASRW.aggregate([
        { $match:{ code_part:{ $nin:parts} }},
        { $group:{
            _id:{ date:{ $substr:["$year_month_approval", 0, 6]}, year:{ $substr:["$year_month_approval", 0, 4]}, month:{ $substr:["$year_month_approval", 4, 2] }  },
            value:{ $sum:"$total_value" }
        }},
        { $sort:{ date:1 }},
        { $project:{
            _id:0,
            info:"Consumo Garantías",
            date:"$_id.date" ,
            year:"$_id.year",
            month:"$_id.month",
            value:"$value"
        }}
    ], (err, valueByZone)=>{
        if(err) return res.status(500).send(err)
        res.status(200).send(valueByZone)
    })
}

function getConsumedByDealer(req, res){
    let parts = []
    for(let i of AllParts){
        for(let j of i.parts){
            parts.push( new RegExp(j))
        }
    }

    
    ASRW.aggregate([
        { $match:{ code_part:{ $nin:parts } }},
        { $group:{
            _id:{ cl:"$cl", date:"$year_month_approval" },
            value:{ $sum:"$total_value"},
            logs:{ $sum:1 },
            avg:{ $avg:"$total_value"},
            min:{ $min:"$total_value"},
            max:{ $max:"$total_value"},
            devPop:{ $stdDevPop:"$total_value"},
            devSam:{ $stdDevSamp:"$total_value"},
        }},
        { $project:{
            _id:0,
            cl:"$_id.cl",
            date:"$_id.date",
            year:{ $substr:["$_id.date", 0, 4]},
            month:{ $substr:["$_id.date", 4, 2]},
            value:"$value",
            logs:"$logs",
            avg:"$avg",
            min:"$min",
            max:"$max",
            devPop:"$devPop",
            devSam:"$devSam"
        }}
    ], (err, consumed)=>{
        if(err) return res.status(200).send(err)
        res.status(200).send(consumed)
    })
}

//get dealers by warranty zone
function getDealersByWarrantyZone(req, res){
    Dealers.find({}, (err, dealers)=>{
        if(err) return res.status(500).send(err)
        res.status(200).send(dealers)
    })
}

//Get budget
function getBudget(req, res){
    let year = req.param('year')
    Budget.find({
        year:year
    }, (err, budget)=>{
        if(err) return res.status(500).send(err)
        res.status(200).send(budget)
    })
}

function getTotalWarrantyDate(req, res){
    ASRW.aggregate([
        { $match:{ code_part:{ $nin:PartsNoSB} }},
        { $match:{ type:{ $nin:['CAMPAÑA', 'DCT']} }},
        { $group:{
            _id:{ date:{ $add:[{ $multiply:[ { $year:"$date_approval" }, 100]}, { $month:"$date_approval"}]}  },
            value:{ $sum:"$total_value"},
            avg:{ $avg:"$total_value"},
            logs:{ $sum:1}
        }},
        { $project:{
            _id:0,
            info:"Aprobación Garantías",
            date:"$_id.date",
            year:{ $substr:["$_id.date", 0, 4] },
            month:{ $substr:["$_id.date", 4, 2] },
            value:"$value",
            avg:"$avg",            
            logs:"$logs"
        } }
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        res.status(200).send(result)
    })
}

function getTotalCampaingDate(req, res){
    ASRW.aggregate([
        //{ $match:{ code_part:{ $nin:PartsNoSB} }},
        //{ $match:{ type:{ $in:['CAMPAÑA']} }},
        { $group:{
            _id:{  date:{ $add:[{ $multiply:[ { $year:"$date_approval" }, 100]}, { $month:"$date_approval"}]}  },
            value:{ $sum:"$total_value"},
            avg:{ $avg:"$total_value"},
            logs:{ $sum:1}
        }},
        { $project:{
            _id:0,
            info:"Campañas",
            date:"$_id.date",
            year:{ $substr:["$_id.date", 0, 4] },
            month:{ $substr:["$_id.date", 4, 2] },
            value:"$value",
            avg:"$avg",
            logs:"$logs"
        } }
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        res.status(200).send(result)
    })
}

function getModels(req, res){
    ASRW.aggregate([
        { $group:{
            _id:{ model:"$model", type:"$type", yearmonth:"$year_month_approval", year:{ $substr:[ "$year_month_approval", 0, 4 ]}, month:{ $substr:[ "$year_month_approval", 4, 2 ]} },
            logs:{ $sum:1 },
            value:{ $sum:"$total_value"},
            avg:{ $avg:"$total_value" }
        }},
        { $project:{
            _id:0,
            info:"Data por Modelo",
            date:"$_id.yearmonth",
            year:"$_id.year",
            month:"$_id.month",
            model:"$_id.model",
            type:"$_id.type",
            logs:"$logs",
            value:"$value",
            avg:"$avg"
        }},
        { $sort:{ logs:-1 }}
    ], (err, types)=>{
        res.status(200).send(types)
    })
}

function getOrigins(req, res){
    ASRW.aggregate([
        { $group:{
            _id:{ wmi:{ $substr:["$vin", 0, 4]}, date:"$year_month_approval" },
            logs:{ $sum: 1},
            value:{ $sum:"$total_value"},
            avg:{ $avg:"$total_value"},
            devPop:{ $stdDevPop:"$total_value"},
            devSam:{ $stdDevSamp:"$total_value"},
            min:{ $min:"$total_value"},
            max:{ $max:"$total_value" }
        }},
        { $project:{
            _id:0,
            info:"Fuentes",
            vin:{ $concat:["$_id.wmi","0000000000000"] },
            origin:"wait",
            date:"$_id.date",
            year:{$substr:["$_id.date", 0, 4]},
            month:{$substr:["$_id.date", 4, 2]},
            logs:"$logs",
            value:"$value",
            avg:"$avg",
            devPop:"$devPop",
            devSam:"$devSam",
            min:"$min",
            max:"$max"
        }}

    ], (err, origins)=>{
        if(err) return res.status(500).send(err)
        if(origins){
            for(let i of origins){
                i.origin = VIN.getRegion(i.vin) +' '+VIN.getCountry(i.vin)
            }
        }
        res.status(200).send(origins)
    })
}

function getDealerOrigin(req, res){
    ASRW.aggregate([
        { $group:{
            _id:{ wmi:{ $substr:["$vin", 0, 4]}, cl:"$cl", date:"$year_month_approval", type:"$type" },
            value:{ $sum:"$total_value"},
            avg:{ $avg:"$total_value" },
            logs:{ $sum:1 }
        }},
        { $project:{
            _id:0,
            vin:{ $concat:["$_id.wmi","0000000000000"] },
            region:"region",
            country:"country",
            origin:"origin",
            cl:"$_id.cl",
            date:"$_id.date",
            type:"$_id.type",
            value:"$value",
            avg:"$avg",
            logs:"$logs"
        }}
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        if(result){
            for(let i of result){
                i.region = VIN.getRegion(i.vin);
                i.country = VIN.getCountry(i.vin);
                i.origin = i.region +' '+ i.country
            }
            res.status(200).send(result)
        }
    })
}

function amountClaimsDealer(req, res){
    PWA.aggregate([
        { $group:{
            _id:{ cl:"$cl", date:{ $substr:["$date_last_send", 0, 7]}, status:"$status" },
            logs:{ $sum: 1}
        }},
        { $project:{
            _id:0,
            info:"Reclamos por Dealer",
            cl:"$_id.cl",
            date:"$_id.date",
            status:"$_id.status",
            logs:"$logs"
        }}
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        res.status(200).send(result)
    })
}

function pwaTimeAverage(req, res){
    let holyDays = HolyDays.getColombiaHolidaysByYear(parseInt(moment().format('YYYY')));
    let today = new Date(moment().format())
    let fromYear = new Date(moment(req.param('fromYear')+'0101', 'YYYYMMDD').format());
    let toYear = new Date(moment(req.param('toYear')+'1231', 'YYYYMMDD').format());
    PWA.aggregate([
        { $match:{ date_set_2:{ $lte:toYear} }},
        { $match:{ date_set_2:{ $gte:fromYear} }},
        { $match:{ status:{ $nin:['EN PROCESO']} }},
        { $group:{ 
            _id:{ pwa:"$pwa", parts:"$parts", vin:"$vin", cl:"$cl", status:"$status", lastSend:"$date_last_send", dateSet:"$date_set", dateApproval:"$date_approval", dateBack:"$date_back",  }
        }},
        { $project:{
            _id:0,
            pwa:"$_id.pwa",
            parts:"$_id.parts",
            vin:"$_id.vin",
            cl:"$_id.cl",
            status:"$_id.status",
            lastSend:"$_id.lastSend",
            dateSet:"$_id.dateSet",
            dateApproval:"$_id.dateApproval",
            dateBack:"$_id.dateBack",
            return:{ $cond:[ { $eq:["$_id.dateBack", null]}, "Sin retorno", "Retornado" ] },
            calendarDays:{ $cond:[ { $eq:[ "$_id.status", "APROBADO" ]}, { $floor:{ $divide:[ { $subtract:[ "$_id.dateApproval", "$_id.lastSend"]}, 1000 * 60 * 60 * 24 ] } },
                { $cond:[ { $eq:[ "$_id.status", "NEGADO" ]}, { $floor:{ $divide:[ { $subtract:[ "$_id.dateSet", "$_id.lastSend"]}, 1000 * 60 * 60 * 24 ] } },
                    { $cond:[ { $eq:[ "$_id.status", "PENDIENTE" ]}, { $floor:{ $divide:[ { $subtract:[ today, "$_id.lastSend"]}, 1000 * 60 * 60 * 24 ] } }, 
                        { $cond:[ { $eq:[ "$_id.status", "RETORNADO" ]}, { $floor:{ $divide:[ { $subtract:[ today, "$_id.dateBack"]}, 1000 * 60 * 60 * 24 ] }}, 
                        { $floor:{ $divide:[ { $subtract:[ today, "$_id.lastSend"]}, 1000 * 60 * 60 * 24 ] }} ]}
                     ]}
                 ]}
            ]},
            startDay:{ $cond:[ { $eq:[ "$_id.status", "APROBADO" ]},{ $dayOfWeek: "$_id.lastSend" }, 
                        { $cond:[ { $eq:[ "$_id.status", "NEGADO" ]}, { $dayOfWeek: "$_id.lastSend" },
                            { $cond:[ { $eq:[ "$_id.status", "PENDIENTE" ] }, { $dayOfWeek: "$_id.lastSend" },
                                { $cond:[ { $eq:[ "$_id.status", "RETORNADO" ] }, { $dayOfWeek: "$_id.dateBack" }, { $dayOfWeek: "$_id.dateSet" } ]}
                             ]}
                         ]}
                     ] },
            endDay:{ $cond:[ {$eq:["$_id.status", "APROBADO"]}, { $dayOfWeek: "$_id.dateApproval" }, 
                        { $cond:[ { $eq:[ "$_id.status", "NEGADO" ]}, { $dayOfWeek: "$_id.dateSet" },
                            { $cond:[ { $eq:[ "$_id.status", "PENDIENTE" ] }, { $dayOfWeek: today },
                                { $cond:[ { $eq:[ "$_id.status", "RETORNADO" ] }, { $dayOfWeek: today }, { $dayOfWeek: today } ]}
                            ]}
                        ]}
                    ]},
            startDate:{ $cond:[ { $eq:[ "$_id.status", "APROBADO" ]},"$_id.lastSend", 
                        { $cond:[ { $eq:[ "$_id.status", "NEGADO" ]}, "$_id.lastSend",
                            { $cond:[ { $eq:[ "$_id.status", "PENDIENTE" ] }, "$_id.lastSend",
                                { $cond:[ { $eq:[ "$_id.status", "RETORNADO" ] },"$_id.dateBack","$_id.dateSet"]}
                            ]}
                        ]}
                    ] },
            endDate:{ $cond:[ {$eq:["$_id.status", "APROBADO"]}, "$_id.dateApproval", 
                        { $cond:[ { $eq:[ "$_id.status", "NEGADO" ]},"$_id.dateSet",
                            { $cond:[ { $eq:[ "$_id.status", "PENDIENTE" ] }, today,
                                { $cond:[ { $eq:[ "$_id.status", "RETORNADO" ] }, today, today ]}
                            ]}
                        ]}
                    ]}
        }},
        { $project:{
            pwa:"$pwa",
            parts:"$parts",
            vin:"$vin",
            cl:"$cl",
            status:"$status",
            lastSend:"$lastSend",
            dateSet:"$dateSet",
            dateApproval:"$dateApproval",
            dateBack:"$dateBack",
            return:"$return",
            calendarDays:"$calendarDays",
            startDay:"$startDay",
            endDay:"$endDay",
            remainder:{ $add:[
                { $abs:{ $subtract:[ "$endDay", "$startDay" ] }}, "$startDay"
            ]},
            startDate:"$startDate",
            endDate:"$endDate",
            weeksBetween:  { $floor:{ $divide:[ "$calendarDays", 7 ]}}

        }},
        { $project:{
            pwa:"$pwa",
            parts:"$parts",
            vin:"$vin",
            cl:"$cl",
            status:"$status",
            lastSend:"$lastSend",
            dateSet:"$dateSet",
            dateApproval:"$dateApproval",
            calendarDays:"$calendarDays",
            dateBack:"$dateBack",
            return:"$return",
            startDay:"$startDay",
            endDay:"$endDay",
            weeksBetween:"$weeksBetween",
            weekendsBetween:{ 
                $add:[ 
                    { $multiply:[ "$weeksBetween", 2 ]},
                    { $cond:[ {$gt:[ "$remainder", 7 ]}, 2, { $cond:[ { $eq: [ "$remainder", 7 ] }, 1, 0 ]} ]},
                    { $cond:[ { $eq: [ "$startDay", 1 ] }, 1, 0 ]}
                ]
            },
            calendarDays:"$calendarDays",
            startDate:"$startDate",
            endDate:"$endDate"
        }},
        { $project:{
            pwa:"$pwa",
            parts:"$parts",
            vin:"$vin",
            cl:"$cl",
            status:"$status",
            dateSet:"$dateSet",
            dateApproval:"$dateApproval",
            calendarDays:"$calendarDays",
            dateBack:"$dateBack",
            return:"$return",
            weeksBetween:"$weeksBetween",
            holydays:{ $sum:0 },
            weekDaysBetween:{ $cond:[ { $lte:[ {$subtract:[ "$calendarDays",  "$weekendsBetween"]}, 0]}, 0, {$subtract:[ "$calendarDays",  "$weekendsBetween"]} ] },
            startDate:"$startDate",
            endDate:"$endDate",
            businessDays:{ $sum:0},
            other:"MTK",
            lastSend:"$lastSend"
        }}
    ], (err, result)=>{
       if(err) return res.status(500).send(err)
       if(result){
           for(let i of result){
               let holidays = 0
                for(let j of holyDays){
                    if( parseInt(moment(i.startDate).format('YYYYMMDD')) < parseInt(moment(j.holiday, 'YYYY-MM-DD').format('YYYYMMDD')) && parseInt( moment(i.endDate).format('YYYYMMDD')) > parseInt(moment(j.holiday, 'YYYY-MM-DD').format('YYYYMMDD')) ){
                        holidays += 1;
                    }
                }
                i.holydays = holidays;
                i.businessDays = i.weekDaysBetween - i.holydays;
                
                for(let j of AllParts){
                    for(let k of j.parts){
                        if(i.parts.toString().split(k).length>1){
                            i.other = j.name;
                        }
                    }
                }
           }
           res.status(200).send({result:result})
       }
    })
}

function srgTimeAverage(req, res){
    let holyDays = HolyDays.getColombiaHolidaysByYear(parseInt(moment().format('YYYY')));
    let today = new Date(moment().format())
    let fromYear = new Date(moment(req.param('fromYear')+'0101', 'YYYYMMDD').format());
    let toYear = new Date(moment(req.param('toYear')+'1231', 'YYYYMMDD').format());

    console.log(fromYear, toYear)
    SRG.aggregate([
        { $match:{ date_create:{ $lte:toYear} }},
        { $match:{ date_create:{ $gte:fromYear} }},
        { $group:{
            _id:{ 
                vin:"$vin",
                part:"$part_code",
                warranty:"$warranty", 
                cl:"$cl", status:"$status", 
                dateLast:{ $cond:[{ $eq:[ "$date_last_send", null]}, new Date(0), "$date_last_send"]}, 
                dateApproval:{ $cond:[{ $eq:[ "$date_approval", null]}, new Date(0), "$date_approval"]}, 
                dateBack:  { $cond:[{ $eq:[ "$date_srg_back", null]}, new Date(0), "$date_srg_back"]}, 
                dateDecision: { $cond:[{ $eq:[ "$date_decision", null]}, new Date(0), "$date_decision"]}, 
                dateRepair:{ $cond:[{ $eq:[ "$repair_date", null]}, new Date(0), "$repair_date"]}  } 
        }},
        { $project:{
            _id:0,
            vin:"$_id.vin",
            part:"$_id.part",
            warranty:"$_id.warranty",
            cl:"$_id.cl",
            status:"$_id.status",
            dateLast:"$_id.dateLast",
            dateApproval:"$_id.dateApproval",
            dateBack:"$_id.dateBack",
            dateDecision:"$_id.dateDecision",
            dateRepair:"$_id.dateRepair",
            finalDate:{ $cond:[ { $eq:[ "$_id.status", "APROBADA"]}, "$_id.dateApproval",
                { $cond:[ { $eq:[ "$_id.status", "NEGADA" ]},"$_id.dateDecision", 
                    { $cond:[ { $eq:[ "$_id.status", "RETORNADO" ] }, "$_id.dateBack", 
                        { $cond:[ { $eq:[ "$_id.status", "PENDIENTE" ] }, "$_id.dateLast", 
                            { $cond:[ { $eq:[ "$_id.status", "EN PROCESO" ] }, "$_id.dateRepair", today ]}
                        ]}
                    ]}
                ] }
            ] }
        }},
        { $project:{
            _id:0,
            vin:"$vin",
            part:"$part",
            warranty:"$warranty",
            cl:"$cl",
            status:"$status",
            dateLast: "$dateLast",
            dateApproval: "$dateApproval",
            dateBack: "$dateBack",
            dateDecision:"$dateDecision",
            dateRepair:"$dateRepair",
            finalDate:"$finalDate",
            calendarDays:{ $cond:[ { $or:[ { $eq:[ "$status", "APROBADA"] }, { $eq:[ "$status", "RETORNADO"] }, { $eq:[ "$status", "NEGADO"] }  ] }, 
                            { $floor:{ $divide:[{ $subtract:[ "$finalDate", "$dateLast" ]}, 1000*60*60*24 ] } }, 
                            { $floor:{ $divide:[{ $subtract:[ today, "$dateLast" ]}, 1000*60*60*24 ] } }
                        ] },
            startDate:{ $cond:[ { $or:[ { $eq:[ "$status", "APROBADA"] }, { $eq:[ "$status", "RETORNADO"] }, { $eq:[ "$status", "NEGADO"] }  ] }, 
                        "$dateLast", 
                        "$dateLast"
                    ] },
            endDate:{ $cond:[ { $or:[ { $eq:[ "$status", "APROBADA"] }, { $eq:[ "$status", "RETORNADO"] }, { $eq:[ "$status", "NEGADO"] }  ] }, 
                        "$finalDate", 
                        today
                    ] },
            startDay:{ $cond:[ { $or:[ { $eq:[ "$status", "APROBADA"] }, { $eq:[ "$status", "RETORNADO"] }, { $eq:[ "$status", "NEGADO"] }  ] }, 
                            { $dayOfWeek: "$dateLast"}, 
                            { $dayOfWeek: "$dateLast"}
                        ] },
            endDay:{ $cond:[ { $or:[ { $eq:[ "$status", "APROBADA"] }, { $eq:[ "$status", "RETORNADO"] }, { $eq:[ "$status", "NEGADO"] }  ] }, 
                        { $dayOfWeek:"$finalDate"}, 
                        { $dayOfWeek:today}
                    ] },
        }},
        { $project:{
            _id:0,
            vin:"$vin",
            part:"$part",
            warranty:"$warranty",
            cl:"$cl",
            status:"$status",
            dateLast:"$dateLast",
            dateApproval:"$dateApproval",
            dateBack:"$dateBack",
            dateDecision:"$dateDecision",
            dateRepair:"$dateRepair",
            finalDate:"$finalDate",
            calendarDays:"$calendarDays",
            startDate:"$startDate",
            endDate:"$endDate",
            startDay:"$startDay",
            endDay:"$endDay",
            startDate:"$startDate",
            endDate:"$endDate",
            weeksBetween:  { $floor:{ $divide:[ "$calendarDays", 7 ]}},
            remainder:{ $add:[
                { $abs:{ $subtract:[ "$endDay", "$startDay" ] }}, "$startDay"
            ]}
        }},
        { $project:{
            vin:"$vin",
            part:"$part",
            warranty:"$warranty",
            cl:"$cl",
            status:"$status",
            dateLast:"$dateLast",
            dateApproval:"$dateApproval",
            dateBack:"$dateBack",
            dateDecision:"$dateDecision",
            dateRepair:"$dateRepair",
            finalDate:"$finalDate",
            calendarDays:"$calendarDays",
            startDate:"$startDate",
            endDate:"$endDate",
            startDay:"$startDay",
            endDay:"$endDay",
            remainder:"$remainder",
            weeksBetween:"$weeksBetween",
            weekendsBetween:{ 
                $add:[ 
                    { $multiply:[ "$weeksBetween", 2 ]},
                    { $cond:[ {$gt:[ "$remainder", 7 ]}, 2, { $cond:[ { $eq: [ "$remainder", 7 ] }, 1, 0 ]} ]},
                    { $cond:[ { $eq: [ "$startDay", 1 ] }, 1, 0 ]},
                    { $cond:[ { $or:[ {$lt:[ { $subtract:[ "$endDay", { $mod:[ "$calendarDays", 7 ] } ] }, 2  ]}, { $gt:[ { $subtract:[ "$endDay", { $mod:[ "$calendarDays", 7 ] } ]}, 6  ] } ] }, 2, 0 ]}
                ]
            },
        }},
        { $project:{
            //     _id:0,
            vin:"$vin",
            part:"$part",
            warranty:"$warranty",
            cl:"$cl",
            status:"$status",
            dateLast:"$dateLast",
            dateApproval:"$dateApproval",
            dateBack:"$dateBack",
            dateDecision:"$dateDecision",
            dateRepair:"$dateRepair",
            finalDate:"$finalDate",
            calendarDays:"$calendarDays",
            startDate:"$startDate",
            endDate:"$endDate",
            startDay:"$startDay",
            endDay:"$endDay",
            remainder:"$remainder",
            weeksBetween:"$weeksBetween",
            businessDays:{$sum:0},
            holydays:{$sum:0},
            weekDaysBetween:{ $cond:[ { $lte:[ {$subtract:[ "$calendarDays",  "$weekendsBetween"]}, 0]}, 0, {$subtract:[ "$calendarDays",  "$weekendsBetween"]} ] },
            other:"MTK"
        }}
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        if(result){
            for(let i of result){
                let holidays = 0
                for(let j of holyDays){
                    if(parseInt(moment(i.startDate).format('YYYYMMDD')) < parseInt(moment(j.holiday, 'YYYY-MM-DD').format('YYYYMMDD')) && parseInt( moment(i.endDate).format('YYYYMMDD')) > parseInt(moment(j.holiday, 'YYYY-MM-DD').format('YYYYMMDD'))){
                        i.holydays = holidays;
                        i.businessDays = i.weekDaysBetween - i.holydays
                    }
                }

                for(let j of AllParts){
                    for(let k of j.parts){
                        if(i.part.toString().split(k).length>1){
                            i.other = j.name;
                        }
                    }
                }
            }
        }
        res.status(200).send(result)
    })

}

// Working Now
function pwaPendingTimeAverage(req, res){
    let holyDays = HolyDays.getColombiaHolidaysByYear(parseInt(moment().format('YYYY')));
    let today = new Date(moment().format())
    // let fromYear = new Date(moment(req.param('fromYear')+'0101', 'YYYYMMDD').format());
    // let toYear = new Date(moment(req.param('toYear')+'1231', 'YYYYMMDD').format());
    let dealers = [];
    for(let i of req.body.dealers){
        dealers.push( new RegExp(i))
    }

    let parts = [];
    for(let i of AllParts){
        if(i.setBudget){
            for(let j of i.parts){
                parts.push(new RegExp(j));
            }
        }
    }
    PWAPending.aggregate([
        { $match:{ cause_code:{ $nin:parts } }},
        { $match:{ cl:{ $in:dealers} } },
        { $match:{ status:{ $nin:['EN PROCESO']} }},
        { $group:{ 
            _id:{ 
                pwa:"$pwa", 
                parts:"$cause_code", 
                vin:"$vin", 
                cl:"$cl", 
                status:"$status", 
                lastSend:"$date_last_send", 
                dateSet:"$date_set", 
                dateApproval:"$date_approval", 
                dateBack:"$date_back" 
            }
        }},
        { $project:{
            _id:0,
            pwa:"$_id.pwa",
            parts:"$_id.parts",
            vin:"$_id.vin",
            cl:"$_id.cl",
            status:"$_id.status",
            lastSend:"$_id.lastSend",
            dateSet:"$_id.dateSet",
            dateApproval:"$_id.dateApproval",
            dateBack:"$_id.dateBack",
            return:{ $cond:[ { $eq:["$_id.dateBack", null]}, "Sin retorno", "Retornado" ] },
            calendarDays:{ $cond:[ { $eq:[ "$_id.status", "APROBADO" ]}, { $floor:{ $divide:[ { $subtract:[ "$_id.dateApproval", "$_id.lastSend"]}, 1000 * 60 * 60 * 24 ] } },
                { $cond:[ { $eq:[ "$_id.status", "NEGADO" ]}, { $floor:{ $divide:[ { $subtract:[ "$_id.dateSet", "$_id.lastSend"]}, 1000 * 60 * 60 * 24 ] } },
                    { $cond:[ { $eq:[ "$_id.status", "PENDIENTE" ]}, { $floor:{ $divide:[ { $subtract:[ today, "$_id.lastSend"]}, 1000 * 60 * 60 * 24 ] } }, 
                        { $cond:[ { $eq:[ "$_id.status", "RETORNADO" ]}, { $floor:{ $divide:[ { $subtract:[ today, "$_id.dateBack"]}, 1000 * 60 * 60 * 24 ] }}, 
                        { $floor:{ $divide:[ { $subtract:[ today, "$_id.lastSend"]}, 1000 * 60 * 60 * 24 ] }} ]}
                     ]}
                 ]}
            ]},
            startDay:{ $cond:[ { $eq:[ "$_id.status", "APROBADO" ]},{ $dayOfWeek: "$_id.lastSend" }, 
                        { $cond:[ { $eq:[ "$_id.status", "NEGADO" ]}, { $dayOfWeek: "$_id.lastSend" },
                            { $cond:[ { $eq:[ "$_id.status", "PENDIENTE" ] }, { $dayOfWeek: "$_id.lastSend" },
                                { $cond:[ { $eq:[ "$_id.status", "RETORNADO" ] }, { $dayOfWeek: "$_id.dateBack" }, { $dayOfWeek: "$_id.dateSet" } ]}
                             ]}
                         ]}
                     ] },
            endDay:{ $cond:[ {$eq:["$_id.status", "APROBADO"]}, { $dayOfWeek: "$_id.dateApproval" }, 
                        { $cond:[ { $eq:[ "$_id.status", "NEGADO" ]}, { $dayOfWeek: "$_id.dateSet" },
                            { $cond:[ { $eq:[ "$_id.status", "PENDIENTE" ] }, { $dayOfWeek: today },
                                { $cond:[ { $eq:[ "$_id.status", "RETORNADO" ] }, { $dayOfWeek: today }, { $dayOfWeek: today } ]}
                            ]}
                        ]}
                    ]},
            startDate:{ $cond:[ { $eq:[ "$_id.status", "APROBADO" ]},"$_id.lastSend", 
                        { $cond:[ { $eq:[ "$_id.status", "NEGADO" ]}, "$_id.lastSend",
                            { $cond:[ { $eq:[ "$_id.status", "PENDIENTE" ] }, "$_id.lastSend",
                                { $cond:[ { $eq:[ "$_id.status", "RETORNADO" ] },"$_id.dateBack","$_id.dateSet"]}
                            ]}
                        ]}
                    ] },
            endDate:{ $cond:[ {$eq:["$_id.status", "APROBADO"]}, "$_id.dateApproval", 
                        { $cond:[ { $eq:[ "$_id.status", "NEGADO" ]},"$_id.dateSet",
                            { $cond:[ { $eq:[ "$_id.status", "PENDIENTE" ] }, today,
                                { $cond:[ { $eq:[ "$_id.status", "RETORNADO" ] }, today, today ]}
                            ]}
                        ]}
                    ]}
        }},
        { $project:{
            pwa:"$pwa",
            parts:"$parts",
            vin:"$vin",
            cl:"$cl",
            status:"$status",
            lastSend:"$lastSend",
            dateSet:"$dateSet",
            dateApproval:"$dateApproval",
            dateBack:"$dateBack",
            return:"$return",
            calendarDays:"$calendarDays",
            startDay:"$startDay",
            endDay:"$endDay",
            remainder:{ $add:[
                { $abs:{ $subtract:[ "$endDay", "$startDay" ] }}, "$startDay"
            ]},
            startDate:"$startDate",
            endDate:"$endDate",
            weeksBetween:  { $floor:{ $divide:[ "$calendarDays", 7 ]}}

        }},
        { $project:{
            pwa:"$pwa",
            parts:"$parts",
            vin:"$vin",
            cl:"$cl",
            status:"$status",
            lastSend:"$lastSend",
            dateSet:"$dateSet",
            dateApproval:"$dateApproval",
            calendarDays:"$calendarDays",
            dateBack:"$dateBack",
            return:"$return",
            startDay:"$startDay",
            endDay:"$endDay",
            weeksBetween:"$weeksBetween",
            weekendsBetween:{ 
                $add:[ 
                    { $multiply:[ "$weeksBetween", 2 ]},
                    { $cond:[ {$gt:[ "$remainder", 7 ]}, 2, { $cond:[ { $eq: [ "$remainder", 7 ] }, 1, 0 ]} ]},
                    { $cond:[ { $eq: [ "$startDay", 1 ] }, 1, 0 ]}
                ]
            },
            calendarDays:"$calendarDays",
            startDate:"$startDate",
            endDate:"$endDate"
        }},
        { $project:{
            pwa:"$pwa",
            parts:"$parts",
            vin:"$vin",
            cl:"$cl",
            status:"$status",
            dateSet:"$dateSet",
            dateApproval:"$dateApproval",
            calendarDays:"$calendarDays",
            dateBack:"$dateBack",
            return:"$return",
            weeksBetween:"$weeksBetween",
            holydays:{ $sum:0 },
            weekDaysBetween:{ $cond:[ { $lte:[ {$subtract:[ "$calendarDays",  "$weekendsBetween"]}, 0]}, 0, {$subtract:[ "$calendarDays",  "$weekendsBetween"]} ] },
            startDate:"$startDate",
            endDate:"$endDate",
            businessDays:{ $sum:0},
            other:"MTK",
            lastSend:"$lastSend"
        }}
    ], (err, result)=>{
       if(err) return res.status(500).send(err)
       if(result){
           for(let i of result){
               let holidays = 0
                for(let j of holyDays){
                    if( parseInt(moment(i.startDate).format('YYYYMMDD')) < parseInt(moment(j.holiday, 'YYYY-MM-DD').format('YYYYMMDD')) && parseInt( moment(i.endDate).format('YYYYMMDD')) > parseInt(moment(j.holiday, 'YYYY-MM-DD').format('YYYYMMDD')) ){
                        holidays += 1;
                    }
                }
                i.holydays = holidays;
                i.businessDays = i.weekDaysBetween - i.holydays;
                
                for(let j of AllParts){
                    for(let k of j.parts){
                        if(i.parts.toString().split(k).length>1){
                            i.other = j.name;
                        }
                    }
                }
           } 
           result.sort((a,b)=>{
                if(a.businessDays < b.businessDays){
                    return 1
                }
                if(a.businessDays < b.businessDays){
                    return -1
                }
                return -1;
            })
           res.status(200).send({result:result, AllOthers:AllOthers, AllParts:AllParts})
       }
    })
}

function srgPendingTimeAverage(req, res){
    let holyDays = HolyDays.getColombiaHolidaysByYear(parseInt(moment().format('YYYY')));
    let today = new Date(moment().format())
    // let fromYear = new Date(moment(req.param('fromYear')+'0101', 'YYYYMMDD').format());
    // let toYear = new Date(moment(req.param('toYear')+'1231', 'YYYYMMDD').format());
    let dealers = [];
    for(let i of req.body.dealers){
        dealers.push( new RegExp(i))
    }

    let parts = [];
    for(let i of AllParts){
        if(i.setBudget){
            for(let j of i.parts){
                parts.push(new RegExp(j));
            }
        }
    }
    SRGPending.aggregate([
        // { $match:{ date_create:{ $lte:toYear} }},
        // { $match:{ date_create:{ $gte:fromYear} }},
        { $match:{ part_code:{ $nin:parts } }},
        { $match:{ cl:{ $in:dealers} } },
        { $group:{
            _id:{ 
                vin:"$vin",
                part:"$part_code",
                warranty:"$warranty", 
                cl:"$cl", status:"$status", 
                dateLast:{ $cond:[{ $eq:[ "$date_last_send", null]}, new Date(0), "$date_last_send"]}, 
                dateApproval:{ $cond:[{ $eq:[ "$date_approval", null]}, new Date(0), "$date_approval"]}, 
                dateBack:  { $cond:[{ $eq:[ "$date_srg_back", null]}, new Date(0), "$date_srg_back"]}, 
                dateDecision: { $cond:[{ $eq:[ "$date_decision", null]}, new Date(0), "$date_decision"]}, 
                dateRepair:{ $cond:[{ $eq:[ "$repair_date", null]}, new Date(0), "$repair_date"]}  } 
        }},
        { $project:{
            _id:0,
            vin:"$_id.vin",
            part:"$_id.part",
            warranty:"$_id.warranty",
            cl:"$_id.cl",
            status:"$_id.status",
            dateLast:"$_id.dateLast",
            dateApproval:"$_id.dateApproval",
            dateBack:"$_id.dateBack",
            dateDecision:"$_id.dateDecision",
            dateRepair:"$_id.dateRepair",
            finalDate:{ $cond:[ { $eq:[ "$_id.status", "APROBADA"]}, "$_id.dateApproval",
                { $cond:[ { $eq:[ "$_id.status", "NEGADA" ]},"$_id.dateDecision", 
                    { $cond:[ { $eq:[ "$_id.status", "RETORNADO" ] }, "$_id.dateBack", 
                        { $cond:[ { $eq:[ "$_id.status", "PENDIENTE" ] }, "$_id.dateLast", 
                            { $cond:[ { $eq:[ "$_id.status", "EN PROCESO" ] }, "$_id.dateRepair", today ]}
                        ]}
                    ]}
                ] }
            ] }
        }},
        { $project:{
            _id:0,
            vin:"$vin",
            part:"$part",
            warranty:"$warranty",
            cl:"$cl",
            status:"$status",
            dateLast: "$dateLast",
            dateApproval: "$dateApproval",
            dateBack: "$dateBack",
            dateDecision:"$dateDecision",
            dateRepair:"$dateRepair",
            finalDate:"$finalDate",
            calendarDays:{ $cond:[ { $or:[ { $eq:[ "$status", "APROBADA"] }, { $eq:[ "$status", "RETORNADO"] }, { $eq:[ "$status", "NEGADO"] }  ] }, 
                            { $floor:{ $divide:[{ $subtract:[ "$finalDate", "$dateLast" ]}, 1000*60*60*24 ] } }, 
                            { $floor:{ $divide:[{ $subtract:[ today, "$dateLast" ]}, 1000*60*60*24 ] } }
                        ] },
            startDate:{ $cond:[ { $or:[ { $eq:[ "$status", "APROBADA"] }, { $eq:[ "$status", "RETORNADO"] }, { $eq:[ "$status", "NEGADO"] }  ] }, 
                        "$dateLast", 
                        "$dateLast"
                    ] },
            endDate:{ $cond:[ { $or:[ { $eq:[ "$status", "APROBADA"] }, { $eq:[ "$status", "RETORNADO"] }, { $eq:[ "$status", "NEGADO"] }  ] }, 
                        "$finalDate", 
                        today
                    ] },
            startDay:{ $cond:[ { $or:[ { $eq:[ "$status", "APROBADA"] }, { $eq:[ "$status", "RETORNADO"] }, { $eq:[ "$status", "NEGADO"] }  ] }, 
                            { $dayOfWeek: "$dateLast"}, 
                            { $dayOfWeek: "$dateLast"}
                        ] },
            endDay:{ $cond:[ { $or:[ { $eq:[ "$status", "APROBADA"] }, { $eq:[ "$status", "RETORNADO"] }, { $eq:[ "$status", "NEGADO"] }  ] }, 
                        { $dayOfWeek:"$finalDate"}, 
                        { $dayOfWeek:today}
                    ] },
        }},
        { $project:{
            _id:0,
            vin:"$vin",
            part:"$part",
            warranty:"$warranty",
            cl:"$cl",
            status:"$status",
            dateLast:"$dateLast",
            dateApproval:"$dateApproval",
            dateBack:"$dateBack",
            dateDecision:"$dateDecision",
            dateRepair:"$dateRepair",
            finalDate:"$finalDate",
            calendarDays:"$calendarDays",
            startDate:"$startDate",
            endDate:"$endDate",
            startDay:"$startDay",
            endDay:"$endDay",
            startDate:"$startDate",
            endDate:"$endDate",
            weeksBetween:  { $floor:{ $divide:[ "$calendarDays", 7 ]}},
            remainder:{ $add:[
                { $abs:{ $subtract:[ "$endDay", "$startDay" ] }}, "$startDay"
            ]}
        }},
        { $project:{
            vin:"$vin",
            part:"$part",
            warranty:"$warranty",
            cl:"$cl",
            status:"$status",
            dateLast:"$dateLast",
            dateApproval:"$dateApproval",
            dateBack:"$dateBack",
            dateDecision:"$dateDecision",
            dateRepair:"$dateRepair",
            finalDate:"$finalDate",
            calendarDays:"$calendarDays",
            startDate:"$startDate",
            endDate:"$endDate",
            startDay:"$startDay",
            endDay:"$endDay",
            remainder:"$remainder",
            weeksBetween:"$weeksBetween",
            weekendsBetween:{ 
                $add:[ 
                    { $multiply:[ "$weeksBetween", 2 ]},
                    { $cond:[ {$gt:[ "$remainder", 7 ]}, 2, { $cond:[ { $eq: [ "$remainder", 7 ] }, 1, 0 ]} ]},
                    { $cond:[ { $eq: [ "$startDay", 1 ] }, 1, 0 ]},
                    { $cond:[ { $or:[ {$lt:[ { $subtract:[ "$endDay", { $mod:[ "$calendarDays", 7 ] } ] }, 2  ]}, { $gt:[ { $subtract:[ "$endDay", { $mod:[ "$calendarDays", 7 ] } ]}, 6  ] } ] }, 2, 0 ]}
                ]
            },
        }},
        { $project:{ 
            vin:"$vin",
            part:"$part",
            warranty:"$warranty",
            cl:"$cl",
            status:"$status",
            dateLast:"$dateLast",
            dateApproval:"$dateApproval",
            dateBack:"$dateBack",
            dateDecision:"$dateDecision",
            dateRepair:"$dateRepair",
            finalDate:"$finalDate",
            calendarDays:"$calendarDays",
            startDate:"$startDate",
            endDate:"$endDate",
            startDay:"$startDay",
            endDay:"$endDay",
            remainder:"$remainder",
            weeksBetween:"$weeksBetween",
            businessDays:{$sum:0},
            holydays:{$sum:0},
            weekDaysBetween:{ $cond:[ { $lte:[ {$subtract:[ "$calendarDays",  "$weekendsBetween"]}, 0]}, 0, {$subtract:[ "$calendarDays",  "$weekendsBetween"]} ] },
            other:"MTK"
        }}
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        if(result){
            for(let i of result){
                let holidays = 0
                for(let j of holyDays){
                    if(parseInt(moment(i.startDate).format('YYYYMMDD')) < parseInt(moment(j.holiday, 'YYYY-MM-DD').format('YYYYMMDD')) && parseInt( moment(i.endDate).format('YYYYMMDD')) > parseInt(moment(j.holiday, 'YYYY-MM-DD').format('YYYYMMDD'))){
                        i.holydays = holidays;
                        i.businessDays = i.weekDaysBetween - i.holydays
                    }
                }

                for(let j of AllParts){
                    for(let k of j.parts){
                        if(i.part.toString().split(k).length>1){
                            i.other = j.name;
                        }
                    }
                }
            }
        }
        res.status(200).send(result)
    })

}

// Evaluación de las cortesías
function getDCSI(req, res, next){
    let type = 'SE';
    let date = parseInt(moment('01/06/2017', 'DD/MM/YYYY').format('YYYYMMDD'))

    DCSI.aggregate([
        { $match:{ date:{ $gte:date} }},
        { $match:{ type:type }},
        { $match:{ cod_dcsi:'BQ010' }},
        { $project:{
            vin:"$vin",
            date:"$date",
            answer:"$answer"
        }},
        { $sort:{ date:-1}}
    ], (err, result)=>{
        if(err) return res.status(500).send(result)
        dcsiAll = result;
        next();
    })
}

function getTickets(req, res, next){
    let date = new Date( moment('01/06/2017', 'DD/MM/YYYY').format() )

    Tickets.aggregate([
        { $match:{ bill_date:{ $gte:date }}},
        { $match:{ typeIn:{ $nin:[ /CASE/, /INT/, /RETO/, /NTR/, /GAC/, /GTIA/ ]} }},
        { $project:{
            vin:"$vin",
            date:"$bill_date",
            type:"$typeIn"
        }},
        { $sort:{ date:-1 }}
    ], (err, result)=>{
        if(err) return res.status(500).send(result)
        ticketAll = result;
        next();
    })
}

function courtesyEvaluation(req, res){
    let type = 'G';
    let date = new Date( moment('01/06/2017', 'DD/MM/YYYY').format() )
    ASRW.aggregate([
        { $match:{ date_approval:{ $gte:date }}},
        { $match:{ type:type}},
        { $project:{
            vin:"$vin",
            date:"$date_approval"
        }}
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        res.status(200).send(consolidateData(dcsiAll, ticketAll, result))
    })
}

function consolidateData(dcsi, tickets, courtesy){
    let data = [];
    let details = {
        totalCourtesy:0,
        list:[],
        promoted:0,
        neutral:0,
        detractor:0
    }
    for(let i=0; i<courtesy.length; i++){
        data.push({
            vin: courtesy[i].vin,
            date: courtesy[i].date,
            satisfaction:0,
            ticketAfterCourtesy:0,
            dcsi:[],
            ticket:[]
        })
        let answerSum=0;
        for(let o=0;  o<dcsi.length; o++){
            if(courtesy[i].vin == dcsi[o].vin){
                let time=''
                if (moment(dcsi[o].date, 'YYYYMMDD').format() > moment(data[i].date).format()){
                    time = 'after'
                } else {
                    time = 'before'
                }
                data[i].dcsi.push({
                    date:dcsi[o].date,
                    answer:dcsi[o].answer *10,
                    time: time
                })
                answerSum += dcsi[o].answer *10;
            }
        }
        if(data[i].dcsi.length > 0){
            data[i].satisfaction = Math.round( answerSum / data[i].dcsi.length )

        }
        for(let o=0; o<tickets.length; o++){
            if(courtesy[i].vin == tickets[o].vin){
                if(tickets[o].date>data[i].date){
                    data[i].ticketAfterCourtesy += 1;
                }
                data[i].ticket.push({
                    date:tickets[o].date,
                    type:tickets[o].type
                })
            }
        }
    }

    details.totalCourtesy = data.length;
    details.list = data;
    return data;
}




module.exports = {
    getOthersBySetBudget,
    getOtherNoSetBusget,
    getAllParts,
    getPartsNoSetBudget,

    // report function
    getValueByOthersGroupDate,
    sendOthersReport,

    //Get budget
    getBudget,

    // Get value
    getConsumed,
    getConsumedByDealer,
    getTotalWarrantyDate,
    getTotalCampaingDate,

    // getDealers
    getDealersByWarrantyZone,

    //Types
    getModels,

    // get origins
    getOrigins,

    //Dealer and Date
    getDealerOrigin,


    // PWA
    amountClaimsDealer,
    pwaTimeAverage,
    // pwaTimeAverageOThers,
    srgTimeAverage,

    pwaPendingTimeAverage,
    srgPendingTimeAverage,

    getDCSI,
    getTickets,
    courtesyEvaluation,
}