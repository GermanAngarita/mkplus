'use strict'

const Dsci = require('../models/dcsi')
const Dealer = require('../models/dealer')
const Color = require('../models/colors')

const moment = require('moment')

let allColors = []
let dealers = []
function getColors(req, res, next){
    Color.findOne({name:'default'}, (err, color)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos Ocurrió un error al obtener los colores', err:err})
        allColors = color;
        next()
    })
}

function getDealers(req, res, next){
    Dealer.find({}, (err, allDealer)=>{
        if(err) return res.status(200).send({msg:'Lo sentimos ocurrio un error al obtener los dealers'})
        dealers = allDealer;
        next()
    })
}

function getKpiHistoy(req, res){
    let dcsi = req.body.code;
    let computed = req.body.computed;
    let limit = req.body.limit;
    let scale = req.body.scale;
    let date = req.body.dateFrom
    let toDate = parseInt( moment(req.body.dateFrom, 'YYYYMMDD').subtract( limit , 'months').format('YYYYMMDD') )
    
   
    Dsci.aggregate([
        { $match: { type:'SE' }},
        { $match: { date:{ $lte:date } }}, 
        { $match: { date:{ $gte:toDate } }},
        { $match: {cod_dcsi:dcsi}},
        { $group:{
            _id:{ period:{ $trunc:{$divide:["$date", 100]} }, dealer:"$cod_dealer", answer:"$answer" } ,
            total:{ $sum:1}
        }},
        { $group:{
            _id:{ answer:"$_id.answer", dealer:"$_id.dealer", period:"$_id.period"},
            total:{ $sum: "$total" }
        }},
        { $group:{ 
            _id:{ dealer:"$_id.dealer", period:"$_id.period"},
            totalAnswers:{ $sum:"$total" },
            answers:{ $push:{
                answer:"$_id.answer",
                total:{ $sum:"$total"}
            }}
         }},
         { $group:{
             _id:"$_id.dealer",
             period:{ $push:{
                 period:"$_id.period",
                 totalAnswers:{ $sum:"$totalAnswers"},
                 kpi:{ $sum:0},
                 color:'',
                 dealer:"$_id.dealer",
                 answers:"$answers"
             }}
         }},
         { $project:{
             _id:0,
             dealer:"$_id",
             result:"$period"
         }}
    ], (err, data)=>{

        data = setAbbreviation(data, dealers)
 
        data.sort((a,b)=>{
            if(a.dealer > b.dealer){
                return 1
            }
            if(a.dealer > b.dealer){
                return -1
            }
            return -1;
        })
        if(err) return res.status(500).send({msg:'ocurrió un error al obtener el Indicador', err:err})
        if(computed=='boolean'){
            res.status(200).send(computedBoolean(data, allColors, scale))
        } else if (computed == 'weighted'){
            res.status(200).send(computedWeighted(data, allColors, scale))

        }

    })
}

function computedBoolean(data, range, scale){
    for(let i of data){
        for(let j of i.result){
            for(let k of j.answers){
                if(k.answer == 1){
                   j.kpi = Math.round(k.total / j.totalAnswers * 100);
                   j.color = setColor(j.kpi, range.colors, scale);
                }
            }
        }
    }
    
    return data
}

function computedWeighted(data, range, scale){
    for(let i of data){
        for(let j of i.result){
            let sum = 0
            for(let k of j.answers){
                sum += k.total * k.answer;
            }
            j.kpi =Math.round((sum / j.totalAnswers)*10);
            j.color = setColor(j.kpi, range.colors, scale);

        }
    }
    
    return data
}

function setColor(value, range, scale){
    // Range Alto
    if(value >= scale.high){
        return allColors.colors.high;
    // Rango Medio    
    } else if (value >= scale.medium && value < scale.high){
        return allColors.colors.medium;
    // Rango Bajo
    } else if (value >= scale.low && value < scale.medium ){
        return allColors.colors.low;
    } else {
        return allColors.colors.very_low
    }
}

function setAbbreviation(data, dealers){
    for(let i of data){
        for(let j of dealers){
            if(j.dealer_cod == i.dealer){
                i.dealer = j.subname_dealer;
            }
        }

        for(let k of i.result){
            for(let j of dealers){
                if(k.dealer == j.dealer_cod){
                k.dealer = j.subname_dealer;
                }
            }
        }
    }
    return data;
}

module.exports = {
    getKpiHistoy,
    getDealers,
    getColors
}