'use strict'

const Evaluation = require('../models/evaluationTMOG')
const Items = require('../models/tmog')
const Dealer = require('../models/dealer')

let getDealers = []

function getDealersAv(req, res, next){
    Dealer.find({}, (err, dealers)=>{
        if(err) return res.status(500).send({msg:'Error al obtener las abreviaturas', err:err})
        getDealers=dealers;
        next();

    })
}

function mobileYear(req, res){
    let periods = req.body.periods;
    let dealer = req.body.group
    Evaluation.aggregate([
        { $match:{ period:{ $in:periods } }},
        { $match:{ dealer:{ $in:dealer } }},
        { $group:{
            _id:{ dealer:"$dealer", period:"$period", result:"$result" }
        }},
        { $group:{
            _id:"$_id.dealer",
            result:{ $push:{
                period:"$_id.period",
                year:{ $trunc:{$divide:["$_id.period", 100]}},
                // month:{  $substrCP:[ { $toString:"$_id.period"}, 4, 5 ]  },
                tmog:{ $trunc:{$multiply:["$_id.result",100]} },
                color:"rgba(255, 255, 255)",
                dealer:"$_id.dealer"
            }}
        }},
        { $project:{
            _id:0,
            dealer:"$_id",
            result:"$result"
        }}
    ], (err, mobileyear)=>{
        if(err) return res.status(500).send({msg:'Ocurrio un error', err:err})
        let data = mobileyear;
        for(let i of data){
            for(let j of i.result){
                if(j.tmog >= 88){
                    j.color ='rgba(119, 241, 134)'
                } else if( j.tmog>=63 && j.tmog < 88){
                    j.color = 'rgb(199, 241, 160)'
                } else if( j.tmog>=25 && j.tmog < 63 ){
                    j.color = 'rgba(249, 234, 43)'
                } else if( j.tmog>=0 && j.tmog < 25 ){
                    j.color = 'rgba(250, 152, 173)'
                }
            }
        }

        
        for(let i of data){
            for(let k of getDealers){
                if(k.dealer_cod == i.dealer){
                    i.dealer = k.subname_dealer;
                }
            }
            for(let j of i.result){
              for(let k of getDealers){
                  if(k.dealer_cod == j.dealer){
                      j.dealer = k.subname_dealer;
                  }
              }
            }
        }

        data.sort((a,b)=>{
            if(a.dealer > b.dealer){
                return 1
            }
            if(a.dealer > b.dealer){
                return -1
            }
            return -1;
        })
        data.unshift({
            dealer:"AVG",
            result:[
                {
                    dealer:"AVG"
                }
            ]
        })

        res.status(200).send(data)
    })
}

function getPeriod(req, res){
    let periods = []
    Evaluation.distinct('period', (err, periods)=>{
        if(err) return res.status(500).send({msg:'Ocurrio un error al traer los periodos', err:err})
        // periods = periods;
        periods.sort(function (a, b) {
            if (a < b) {
                return 1;
            }
            if (a > b) {
                return -1;
            }
            return 0;
        });
        res.status(200).send(periods)
    })
}

function getResumeTMOG(req, res){
    let dealer = req.body.dealers
    let periods = req.body.periods
    let version = req.body.versions
    Items.aggregate([
        { $match:{ version:{ $in:version } }},
        { $match:{ date:{ $in:periods } }},
        { $match:{ dealer:{ $in:dealer } }},
        { $group:{
            _id:{ period:"$date", code:"$code",  category:"$code_category" },
            answer:{ $avg:"$answer" }
        } },
        { $group:{
            _id:{ code:"$_id.code",  category:"$_id.category" },
            answer:{ $avg:"$answer"},
            period:{ $push:{
                period:"$_id.period",
                avg:{ $avg:"$answer"}
            } }
        }},
        { $group:{
            _id:{ category:"$_id.category" },
            result:{ $avg:"$answer" },
            questions:{ $push:{
                item:"$_id.code",
                avg:"$answer",
                period:"$period"
                
            }}
        } },
        { $project:{
            _id:0,
            category:"$_id.category",
            result:"$result",
            questions:"$questions"
        } }
        
    ], (err, resume)=>{
        if(err) return res.status(500).send({msg:'Error al obtener el resumen de evaluación', err:err})
        res.status(200).send(resume)

    })
}

function getDateTMOG(req, res){
    Items.aggregate([
        { $group:{
            _id:"$date"
        }},
        { $project:{
            _id:0,
            date:"$_id"
        }},
        { $sort:{ date:-1 } }
    ], (err, dates)=>{
        if(err) return res.status(500).send({msg:'Error al obtener las fechas disponibles', err:err})
        res.status(200).send(dates)
    })
}

module.exports = {
    getDealersAv,
    mobileYear,
    getPeriod,
    getResumeTMOG,
    getDateTMOG
}