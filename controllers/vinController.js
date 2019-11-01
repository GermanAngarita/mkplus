'use strict'

const Vin = require('../models/vin')
const Tickect = require('../models/ticket')
const Dealer = require('../models/dealer')
const Model = require('../models/model')
const moment = require('moment')

const SRG = require('../models/srg')
const PWA = require('../models/pwa')
const DCSI = require('../models/dcsi')


let vioByDealer = []
let dealerAv = []
let citysGroup = []
let typesTable = []
let typesUse = []
let ModelDecoder = []
// let colors = [
//     '#f75884',
//     '#f7cb58',
//     '#f77c58',
//     '#58d4f7',
//     '#7c58f7',
//     '#5884f7',  
// ]
// let colors2 = [
//     '#89a8f9',
//     '#7096f8',
//     '#5884f7',
//     '#4072f6',
//     '#2760f5',
//     '#0f4ef4',
// ]

let scale = {
    high:86,
    medium:69,
    low:55,
    very_low:0,
}
let allColors = {
    colors:{
        high:'#77F186',
        medium:'#F9EA2B',
        low:'#FA98AD',
        very_low:'#DF3A01',
        
    }
}
//Funciones del Buscador de VIN
function getVinById(req, res){
    let id = req.body.id
    Vin.findById(id, (err, vin)=>{
        if(err) return res.status(500).send({msg:`Error al obtener el vin`, err:err})
        res.status(200).send(vin)

    })
}
// Se utiliza en la busqueda de Vin ../vin/search
function getByVin(req, res){
    let dateFrom = new Date( req.body.dateFrom )
    let dateTo = new Date( req.body.dateTo )

    let skip = req.body.skip;
    let limit = req.body.limit;
    let vin = new RegExp(req.body.vin)
    let article = new RegExp(req.body.article)
    let cod_model = new RegExp(req.body.cod_model)
    let plate = new RegExp(req.body.plate)
    let sales_cod = new RegExp(req.body.sales_cod)
    Vin.find({
        vin:vin,
        article:article,
        cod_model:cod_model,
        id:plate,
        sales_cod:sales_cod,
        date_init_warranty:{ $gte:dateFrom, $lte:dateTo }
    }, (err, vin)=>{
        if(err) return res.status(500).send({msg:`Error al obtener el vin`, err:err})
        if(vin && vin.length>0){
            res.status(200).send(vin)
        } else {
            res.status(200).send({msg:`Lo sentimos, no se encontró información`, status:404  })
        }
    }).skip(skip).limit(limit)
}

function getByJustVin(req, res){
    let vin = new RegExp(req.body.vin)
    let skip = req.body.skip;
    let limit = req.body.limit;

    Vin.find({
        vin:vin
    }, (err, vin)=>{
        if(err) return res.status(500).send({msg:`Error al obtener el vin`, err:err})
        if(vin && vin.length>0){
            res.status(200).send(vin)
        } else {
            res.status(200).send({msg:`Lo sentimos, no se encontró información`, status:404  })
        }
    }).skip(skip).limit(limit)
}

function getCountByJustVin(req, res){


    let vin = new RegExp(req.body.vin)

    Vin.count({
        vin:vin
    }, (err, vin)=>{
        if(err) return res.status(500).send({msg:`Error al obtener el vin`, err:err})
        if(vin){
            res.status(200).send({count:vin})
        } else {
            res.status(500).send({msg:`Lo sentimos, no se encontró información`, status:404  })
        }
        
    })
}

function getCountByVin(req, res){
    let dateFrom = new Date( req.body.dateFrom )
    let dateTo = new Date( req.body.dateTo )


    let vin = new RegExp(req.body.vin)
    let article = new RegExp(req.body.article)
    let cod_model = new RegExp(req.body.cod_model)
    let plate = new RegExp(req.body.plate)
    let sales_cod = new RegExp(req.body.sales_cod)

    Vin.count({
        vin:vin,
        article:article,
        cod_model:cod_model,
        id:plate,
        sales_cod:sales_cod,
        // date_init_warranty:{ $gte:dateFrom, $lte:dateTo }

    }, (err, vin)=>{
        if(err) return res.status(500).send({msg:`Error al obtener el vin`, err:err})
        if(vin){
            res.status(200).send({count:vin})
        } else {
            res.status(500).send({msg:`Lo sentimos, no se encontró información`, status:404  })
        }
        
    })
}


function getCityFilter(req, res){

    res.status(200).send(citysGroup)
}

// Complementary data find VIN
function srgListByVin(req, res){
    let vin = req.body.vin
    SRG.find({vin:vin}, (err, result)=>{
        if(err) return res.status(500).send(err)
        res.status(200).send(result)
    }).sort({date_create:-1})
}

function pwaListByVin(req, res){
    let vin = req.body.vin
    PWA.find({vin:vin}, (err, result)=>{
        if(err) return res.status(500).send(err)
        res.status(200).send(result)
    }).sort({date_set_2:-1})
}

function dcsiListByVin(req, res){
    let vin = req.body.vin;
    DCSI.aggregate([
        { $match:{ vin:vin }},
        { $group:{
            _id:{ date:"$date", dealer:"$cod_dealer", dcsi:"$cod_dcsi", answer:"$answer", verbatim:"$answerOpen"}
        }},
        { $group:{
            _id:"$_id.date",
            survey:{ $push:{
                dealer:"$_id.dealer",
                dcsi:"$_id.dcsi",
                answer:"$_id.answer",
                verbatim:"$_id.verbatim",
                date:"$_id.date"
            }}
        }},
        { $project:{
            _id:0,
            date:"$_id",
            survey:"$survey"
        }}
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        res.status(200).send(result)
    })
}

function kacsByVin(req, res){
    let vin = req.body.vin;
    let data = {result:[], date:[], value:[], dealer:[], color:[]}
    DCSI.aggregate([
        { $match:{ vin:vin }},
        { $match:{ cod_dcsi:"BQ010" }},
        { $project:{
            _id:0,
            date:"$date",
            dealer:"$cod_dealer",
            dcsi:"$cod_dcsi",
            answer:"$answer"
        }},
        { $sort:{date:1}}
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        if(result){
            data.result = result;
            for(let i of result){
                data.date.push(i.date);
                data.value.push( Math.round((i.answer/10)*100));
                data.dealer.push(i.dealer);
                data.color.push(setColor(Math.round((i.answer/10)*100), scale))
            }
        }
        res.status(200).send(data)
    })
}

function retentionByVin(req, res){
    let vin = req.body.vin;
    let data = {result:[], date:[], value:[], dealer:[], color:[]}
    DCSI.aggregate([
        { $match:{ vin:vin }},
        { $match:{ cod_dcsi:"CQ020" }},
        { $project:{
            _id:0,
            date:"$date",
            dealer:"$cod_dealer",
            dcsi:"$cod_dcsi",
            answer:"$answer"
        }},
        { $sort:{date:1}}
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        if(result){
            data.result = result;
            for(let i of result){
                data.date.push(i.date);
                data.value.push( Math.round((i.answer/10)*100));
                data.dealer.push(i.dealer);
                data.color.push(setColor(Math.round((i.answer/10)*100), scale))
            }
        }
        res.status(200).send(data)
    })
}

function recommendByVin(req, res){
    let vin = req.body.vin;
    let data = {result:[], date:[], value:[], dealer:[], color:[]}
    DCSI.aggregate([
        { $match:{ vin:vin }},
        { $match:{ cod_dcsi:"CQ010" }},
        { $project:{
            _id:0,
            date:"$date",
            dealer:"$cod_dealer",
            dcsi:"$cod_dcsi",
            answer:"$answer"
        }},
        { $sort:{date:1}}
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        if(result){
            data.result = result;
            for(let i of result){
                data.date.push(i.date);
                data.value.push( Math.round((i.answer/10)*100));
                data.dealer.push(i.dealer);
                data.color.push(setColor(Math.round((i.answer/10)*100), scale))
            }
        }
        res.status(200).send(data)
    })
}

function frftByVin(req, res){
    let vin = req.body.vin;
    
    let data = { date:[], value:[], result:[], color:[]}
    DCSI.aggregate([
        { $match:{ vin:vin }},
        { $match:{ cod_dcsi:"BQ020" }},
        { $project:{
            _id:0,
            date:"$date",
            dealer:"$cod_dealer",
            dcsi:"cod_dcsi",
            answer:"$answer"
        }}
    ], (err, result)=>{
        if(err) res.status(500).send(err);
        if(result){
            for(let i of result){
                data.date.push(i.date);
                data.value.push(i.answer);
                data.result.push(i.answer==1? 100:0);
                data.color.push(setColor(i.answer==1? 100:0, scale))
            }
            res.status(200).send(data)
        }
    })
}

function loyaltyByVin(req, res){
    let vin = req.body.vin;
    let data = {result:[], date:[], value:[], dealer:[], color:[]}
    DCSI.aggregate([
        { $match:{ vin:vin }},
        { $match:{ cod_dcsi:{ $in:["BQ010", "CQ010", "CQ020"] } }},
        { $group:{
            _id:{ date:"$date" },
            survey:{ $push:{
                dcsi:"$cod_dcsi",
                answer:"$answer",
                dealer:"$cod_dealer"
            }}
        }},
        { $project:{
            _id:0,
            date:"$_id.date",
            survey:"$survey",

        }},
        { $sort:{ date:1 }}
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        if(result){
            for(let i of result){
                data.result = result;
                data.date.push(i.date);
                let typeCustomer = 'No definido';
                let dealer = '';
                let color = '';
                let isLoyalty=0;
                for(let j of i.survey){ 
                    
                    if(j.answer > 8){
                        isLoyalty+= 10;
                    } else if(j.answer>6 && j.answer < 9){
                        isLoyalty+= 5;
                    } else {
                        isLoyalty+= 0;
                    }
                    dealer=j.dealer
                }
                if(isLoyalty== 30){
                    typeCustomer = 'Leal';
                    color = allColors.colors.high;
                } else if(isLoyalty == 25) {
                    typeCustomer = 'Neutral Alto';
                    color = allColors.colors.medium;
                } else if(isLoyalty == 20) {
                    typeCustomer = 'Neutral Medio';
                    color = allColors.colors.medium;
                } else if(isLoyalty == 15) {
                    typeCustomer = 'Neutral Bajo Posible Detractor';
                    color = allColors.colors.low;
                } else if(isLoyalty < 15) {
                    typeCustomer = 'Detractor';
                    color = allColors.colors.low;
                }
                data.value.push(typeCustomer);
                data.dealer.push(dealer);
                data.color.push(color);
                
            }
            res.status(200).send(data)
        }
    })
}


//Math dev standard
function getDesvest(data){
    let n = data.length;
    let x = avg(data)
    let sum = 0
    let deves = 0
    if(n>1){
        for(let i of data){
            deves = Math.sqrt(((i - x) * (i - x))/ (n - 1))
        }
    } else {
        deves = 0
    }
    
    return Math.round( deves * 100)/100
}
function avg(data){
    let n = data.length;
    let sum = 0
    for(let i of data){
        sum = i + sum
    }
    return sum/n
}
//End desvest


// //Get Citys => group dealers
function getCitys(req, res, next){
    Dealer.aggregate([
        { $group:{
            _id:{ city:"$city", dealer:"$dealer_cod", av:"$subname_dealer" }
        }},
        { $group:{
            _id:"$_id.city",
            dealer:{ $push:{
                cl:"$_id.dealer",
                av:"$_id.av",
                data:""
            } }
        } },
        { $project:{
            _id:0,
            city:"$_id",
            dealer:"$dealer",
        }},
        { $sort: { city:1 } }
    ], (err, citys)=>{
        if(err) return res.status(500).send({msg:'Error al obtener las ciudades'})
        citysGroup = citys
        next()
    })
}


function getKeys(req, res){
    let paths = []
    Vin.schema.eachPath((path)=>{
        paths.push({
            key:path,
            value:true
        })
    })
    res.status(200).send(paths)
}

// utils
function setColor(value, scale){
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




module.exports = { 
    getByVin,
    getByJustVin,
    getVinById,
    getCountByJustVin,
    getCountByVin,
    getCitys,
    getCityFilter,
    srgListByVin,
    pwaListByVin,
    dcsiListByVin,
    kacsByVin,
    retentionByVin,
    recommendByVin,
    loyaltyByVin,
    frftByVin,
    getKeys
    
 }