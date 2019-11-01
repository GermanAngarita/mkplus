'use strict'

const IndustryReport = require('../models/industry_report')
const Dealer = require('../models/dealer')
const Statisc = require('../statistics/statistic')
const moment = require('moment')

let dealers = []


// Obtener la codificación de los dealer
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
        dealers = dealer
        next()
    })
}

//Reporte: Promedio Entradas a Mecánica y Colisión por Dealer
function incomeReportAVGByDealer(req, res){
    let data={ label:[], mechanic:[], collision:[], mechanic_parts:[], collision_parts:[], showroom_parts:[] }
    IndustryReport.aggregate([
        { $group:{
            _id:{ dealer:"$dealer_cod" },
            mechanic:{ $avg:"$mechanic" },
            collision:{ $avg:"$collision"},
            mechanic_parts:{ $avg:"$mechanic_parts"},
            collision_parts:{ $avg:"$collision_parts"},
            showroom_parts: { $avg:"$showroom_parts"}
        }},
        { $project:{
            _id:0,
            dealer:"$_id.dealer",
            av:"",
            mechanic:"$mechanic",
            collision:"$collision",
            mechanic_parts:"$mechanic_parts",
            collision_parts:"$collision_parts",
            showroom_parts:"$showroom_parts"
        }}
    ], (err, income)=>{
        if(err) return res.status(500).send({msg:'Error al obtener los datos', err:err})
        if(income){
            for(let i of income){
                for(let j of dealers){
                    if(i.dealer == j.cl){
                        i.av = j.av
                    }
                }
            }
        }
        income.sort((a,b)=>{
            if(a.av > b.av){
                return 1
            }
            if(a.av > b.av){
                return -1
            }
            return -1;
        })
        for(let i of income){
            // Guardar los dealer
            data.label.push( i.av )
            data.mechanic.push(Math.round(i.mechanic*100)/100)
            data.collision.push(Math.round(i.collision*100)/100)
            data.mechanic_parts.push(Math.round(i.mechanic_parts*100)/100)
            data.collision_parts.push(Math.round(i.collision_parts*100)/100)
            data.showroom_parts.push(Math.round(i.showroom_parts*100)/100)
        }
        res.status(200).send(data)
    })
}
//Reporte: Promedio Entradas a Mecánica y Colisión por Periodo
function incomeReportAVGByDate(req, res){
    let data={ label:[], mechanic:[], collision:[], mechanic_parts:[], collision_parts:[], showroom_parts:[] }
    IndustryReport.aggregate([
        { $group:{
            _id:{ date:"$date" },
            mechanic:{ $avg:"$mechanic"},
            collision:{ $avg:"$collision"},
            mechanic_parts:{ $avg:"$mechanic_parts"},
            collision_parts:{ $avg:"$collision_parts"},
            showroom_parts: { $avg:"$showroom_parts"}
        }},
        { $project:{
            _id:0,
            date:"$_id.date",
            mechanic:"$mechanic",
            collision:"$collision",
            mechanic_parts:"$mechanic_parts",
            collision_parts:"$collision_parts",
            showroom_parts:"$showroom_parts"
        }},
        { $sort: { date:-1 }},
        { $limit: 12 },
        { $sort: { date:1}}
    ], (err, income)=>{
        if(err) return res.status(500).send({msg:'Error al obtener el reporte', err:err})
        for(let i of income){
            // Guardar los dealer
            data.label.push( i.date )
            data.mechanic.push(Math.round(i.mechanic*100)/100)
            data.collision.push(Math.round(i.collision*100)/100)
            data.mechanic_parts.push(Math.round(i.mechanic_parts*100)/100)
            data.collision_parts.push(Math.round(i.collision_parts*100)/100)
            data.showroom_parts.push(Math.round(i.showroom_parts*100)/100)
        }
        res.status(200).send(data)
    })
}
// Reporte Total Entradas a Mecánica y Colisión por Dealer
function incomeReportTotalByDealer(req, res){
    let data={ label:[], 
        mechanic:[], 
        collision:[], 
        mechanic_parts:[], 
        collision_parts:[], 
        showroom_parts:[], 
        mechanic_ticket:[], 
        collision_ticket:[], 
        mechanic_ticket_avg:[],
        collision_ticket_avg:[],
        mechanic_parts_percent:[],
        collision_parts_percent:[],
        showroom_parts_percent:[] }
    let from = req.body.fromDate
    let to = req.body.toDate
    let group = req.body.group
    IndustryReport.aggregate([
        { $match: { date:{ $gte:from } }},
        { $match: { date:{ $lte:to } }},
        { $match: { dealer_cod:{ $in:group } }},
        { $group:{
            _id: { dealer:"$dealer_cod"},
            mechanic:{ $sum:"$mechanic" },
            collision:{ $sum:"$collision"},
            mechanic_parts:{ $sum:"$mechanic_parts"},
            collision_parts:{ $sum:"$collision_parts"},
            showroom_parts: { $sum:"$showroom_parts"}
        }},
        { $project:{
            _id:0,
            dealer:"$_id.dealer",
            av:"",
            mechanic:"$mechanic",
            collision:"$collision",
            mechanic_parts:"$mechanic_parts",
            collision_parts:"$collision_parts",
            showroom_parts:"$showroom_parts"
        }}
    ], (err, income)=>{
        if(err) return res.status(500).send({msg:'Error al obtener el reporte', err:err})
        if(income){
            for(let i of income){
                for(let j of dealers){
                    if(i.dealer == j.cl){
                        i.av = j.av
                    }
                }
            }
        }
        income.sort((a,b)=>{
            if(a.av > b.av){
                return 1
            }
            if(a.av > b.av){
                return -1
            }
            return -1;
        })
        for(let i of income){
            // Guardar los dealer
            data.label.push( i.av )
            data.mechanic.push(Math.round(i.mechanic*100)/100)
            data.collision.push(Math.round(i.collision*100)/100)
            data.mechanic_parts.push( Math.round(i.mechanic_parts*100)/100 )
            data.collision_parts.push(Math.round(i.collision_parts*100)/100)
            data.showroom_parts.push(Math.round(i.showroom_parts*100)/100)
            data.mechanic_ticket.push( Math.round( (i.mechanic_parts/i.mechanic)  ) )
            data.collision_ticket.push( Math.round( i.collision_parts/i.collision ) )
            data.mechanic_parts_percent.push( Math.round( (i.mechanic_parts / (i.mechanic_parts + i.collision_parts + i.showroom_parts) *10000 )/100 ) ) //Sumar para sacar los porcentajes
            data.collision_parts_percent.push( Math.round( (i.collision_parts / (i.mechanic_parts + i.collision_parts + i.showroom_parts) *10000 )/100 ) )
            data.showroom_parts_percent.push( Math.round( (i.showroom_parts / (i.mechanic_parts + i.collision_parts + i.showroom_parts) *10000 )/100 ) )
        }
        data.mechanic_ticket_avg = Statisc.avg(data.mechanic_ticket)
        data.collision_ticket_avg = Statisc.avg(data.collision_ticket)
        res.status(200).send(data)
    })
}

// Reporte: Total Entradas a Mecánica y Colisión por Periodo
function incomeReportTotalByDate(req, res){
    let group = req.body.group
    let per = req.body.per
    let data={ 
        label:[], 
        mechanic:[], 
        collision:[], 
        mechanic_parts:[], 
        collision_parts:[], 
        showroom_parts:[], 
        ticket:[], 
        trendline:[], 
        ticket_mechanic:[], 
        ticket_collision:[],
        ticket_mechanic_avg:[],
        ticket_collision_avg:[],
        trend_ticket_mechanic:[],
        trend_ticket_collison:[] }
    IndustryReport.aggregate([
        { $match: { dealer_cod:{ $in:group} }},
        { $group:{
            _id:{ date:"$date"},
            mechanic:{ $sum:"$mechanic"},
            collision:{ $sum:"$collision"},
            mechanic_parts:{ $sum:"$mechanic_parts"},
            collision_parts:{ $sum:"$collision_parts"},
            showroom_parts: { $sum:"$showroom_parts"}
        }},
        { $project:{
            _id:0,
            date:"$_id.date",
            mechanic:"$mechanic",
            collision:"$collision",
            mechanic_parts:"$mechanic_parts",
            collision_parts:"$collision_parts",
            showroom_parts:"$showroom_parts",
            // ticket: { $divide:[ {$sum:["$mechanic_parts", "$collision_parts"]}, {$sum:["$mechanic", "$collision"]} ]},
            // ticket_mechanic:{ $divide:[ "$mechanic_parts", "$mechanic" ] },
            // ticket_collision:{ $divide:[ "$collision_parts", "$collision" ] }
        }},
        { $sort:{ date:-1 }},
        { $limit: per },   
        { $sort: { date:1 }}
    ], (err, income)=>{
        if(err) return res.status(500).send({msg:'Error al obtener la información', err:err})
        for(let i of income){
            // Guardar los dealer
            data.label.push( i.date )
            data.mechanic.push(Math.round(i.mechanic*100)/100)
            data.collision.push(Math.round(i.collision*100)/100)
            data.mechanic_parts.push(Math.round(i.mechanic_parts*100)/100)
            data.collision_parts.push(Math.round(i.collision_parts*100)/100)
            data.showroom_parts.push(Math.round(i.showroom_parts*100)/100)

            if((i.mechanic + i.collision) > 0){
                data.ticket.push( Math.round( (i.mechanic_parts + i.collision_parts) / (i.mechanic + i.collision)*100 )/100  )
            } else {
                data.ticket.push(0)
            }
            if(i.mechanic > 0){
                data.ticket_mechanic.push( Math.round( (i.mechanic_parts / i.mechanic) *100 )/100 )
            } else {
                data.ticket_mechanic.push(0)
            }

            if(i.collision > 0){
                data.ticket_collision.push( Math.round( i.collision_parts / i.collision *100)/100 )
            } else {
                data.ticket_collision.push( 0 )
            }
            
            if(i.collision > 0 || i.mechanic > 0){
                data.ticket_mechanic_avg.push( Math.round( (i.mechanic_parts / i.mechanic) / ( (i.mechanic_parts / i.mechanic)+ ( i.collision_parts / i.collision))*100)/100 )
                data.ticket_collision_avg.push( Math.round( ( i.collision_parts / i.collision ) / ( (i.mechanic_parts / i.mechanic) + ( i.collision_parts / i.collision))*100)/100 )
            }
            
            
        }
        data.trendline = trend(data.ticket)
        data.trend_ticket_mechanic = trend(data.ticket_mechanic)
        data.trend_ticket_collison = trend(data.ticket_collision)
        
        
        res.status(200).send(data)
    })
}

function trend(data){
    // Object Array:[item, item..]
    let trend = {trend:[], ticketAVG:0 }
    let periodos = parseInt(data.length);
    let x = 0;
    let xAvg = 0; let yAvg = 0;
    let y = 0;
    let xy = 0;
    let x2 = 0;
    let b = 0; let a = 0;
    for(let i=0; i< parseInt(periodos); i++){
        x = x + i+1
        y = y + data[i]
        xy = xy + ((i+1) * (data[i]))
        x2 = x2 + (i+1)*(i+1)
    }
    xAvg = x / periodos;
    yAvg = y / periodos;
    // Obtener el valor de 'b'
    b = ((periodos * xy) - (x * y)) / ((periodos * x2) - (x*x))

    //Obtener el valor de 'a'
    a = yAvg - b*xAvg;

    //Ecuación de la recta
    for(let i=0; i<periodos; i++){
        trend.trend.push( Math.round(a + (b*( i+1))) )
    }
    trend.ticketAVG = Math.round(yAvg*100) / 100
    return trend;
}


//Obtener información para los filtros
function getPer(req, res){
    IndustryReport.aggregate([
        { $group:{
            _id:{date:"$date"}
        }},
        { $project:{
            _id:0,
            periodo:"$_id.date",
            // from: { $concat:[ { $toString:"$_id.date" } ,'01']  },
            // to: { $concat:[ { $toString:"$_id.date" }, '31' ] } 
            from:"",
            to:""
        }},
        { $sort:{periodo:-1}}
    ], (err, per)=>{
        if(err) return res.status(500).send({msg:'Error al obtener los periodos', err:err})
        if(per && per.length>0){
            for(let i of per){
                i.from = i.periodo.toString() + '01';
                i.to = i.periodo.toString() + '31'
            }
        }
        res.status(200).send(per)
    })
}

module.exports = {
    incomeReportAVGByDealer,
    incomeReportAVGByDate,
    incomeReportTotalByDealer,
    incomeReportTotalByDate,
    getDealer,

    getPer
    
}