'use strict'
const Dcsi = require('../models/dcsi')
const Model = require('../models/model')
const Dealer = require('../models/dealer')
let models = []
let dealers = []

let verde = 'rgba(119, 241, 134)';
let amarillo = 'rgba(249, 234, 43)';
let rojo = 'rgba(250, 152, 173)'

// Obtener la codificacion de los modelos
function getModels(req, res, next){
    models = []
    Model.aggregate([
        { $group:{
            _id:{ model:"$model", vin:"$sixDigit"}
        }},
        { $group:{
            _id:"$_id.model",
            vin:{ $push:{
                vin:"$_id.vin",
                surveys:"",
                kpi:""
            }}
        }},
        { $project:{
            _id:0,
            model:"$_id",
            kpiModel:"null",
            surveys:"null",
            partitionColor:"",
            vin:"$vin",
        }}
    ],(err, model)=>{
        if(err) return res.status(500).send({message:`Error al Obtener los modelos ${err}`})
        models = model
        next()
    })
}
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

function getFilterModel( req, res){
    Model.aggregate([
        { $group:{
            _id:{ model:"$model", vin:"$sixDigit" }
        }},
        { $group: {
            _id:"$_id.model",
            vins:{ $push:{
                vin:"$_id.vin"
            }}
        }},
        { $project:{
            _id:0,
            model:"$_id",
            description:"$description",
            vins:"$vins"
        }},
        { $sort: { model:1}}
    ],(err, model)=>{
        if(err) return res.status(500).send({message:`Error al obtener los modelos ${err}`})
        res.status(200).send(model)
    })
}

// Function Core Controller
function kascByModel(req, res){
    dealers = []
    let data = {
        labels:[], 
        values:[], 
        color:[], 
        surveys:[], 
        partition:[], 
        partitionColor:[],
        avg:[],
        total:0}
    let dateFrom = parseInt(req.body.fromDate)
    let dateTo = parseInt(req.body.toDate) 
    let group = req.body.group
    Dcsi.aggregate([
        { $match: { date:{$lte:dateTo} }},
        { $match: { date:{$gte:dateFrom} }},
        { $match: { cod_dealer:{$in: group} }},
        { $match: { answer:{ $nin:[0]} }},
        { $match:{ cod_dcsi:"BQ010" }},
        { $group:{
            _id:{ vin:{ $substr:["$vin",0,6]}, answer:"$answer", },
            total:{ $sum: 1}
        }},
        { $group:{
            _id:"$_id.vin",
            total:{ $sum:"$total"},
            answer:{ $push:{
                answer:"$_id.answer",
                total:{ $sum:"$total" },
                points:{ $multiply:[ { $sum:"$total" }, "$_id.answer" ]}
            }}
        }},
        { $project:{
            _id:0,
            vin:"$_id",
            model:"",
            kpi:"",
            surveys:"$total",
            maxPoint: "",
            answers:"$answer"
        }}
    ], (err, kasc)=>{
        if(err) return res.status(500).send({message:`Error al consultar KASC MODEL ${err}`})
        //Get KPI
        for(let i of kasc){
            let total = 0
            i.maxPoint = i.surveys * 10
            for(let j of i.answers){
                total += j.points
            }
            i.kpi = Math.round( (total / i.maxPoint)*10000 )/100
        }
        // Set KPI to each VIN
        for(let i of kasc){
            for(let j of models){
                for(let k of j.vin){
                    if(i.vin == k.vin){
                        k.kpi = i.kpi
                        k.surveys = i.surveys
                        i.model = j.model
                    }
                }
            }
        }
        //Get Averages
        let totalSurveys = 0
        for(let i of models){
            let avg = 0; let total = 0
            let surveys = 0
            for(let j of i.vin){
                if(j.kpi){
                    avg += j.kpi
                    total += 1
                    surveys += j.surveys
                } else {

                }
            }
            totalSurveys += surveys
            i.surveys = surveys
            i.kpiModel = avg / total
        }
        //Sort by Surveys
        models.sort( (a, b)=>{
            if(a.surveys > b.surveys){
                return -1;
            }
            if(a.surveys < b.surveys){
                return 1
            }
            return 0
        })
        for(let i=0; i<models.length; i++){
            if( i < 5){
                models[i].partitionColor = verde
            } else if ( i > 4 && i < 10 ){
                models[i].partitionColor = amarillo
            } else {
                models[i].partitionColor = rojo
            }
        }

        let avgCountryAcc = 0
        //Set Data Object and Send :D
        for(let i of models){
            if(!isNaN(i.kpiModel)){

                data.labels.push(i.model)
                data.values.push(
                    Math.round( i.kpiModel *100 )/100
                )
                data.surveys.push( i.surveys )
                data.partition.push( Math.round( (i.surveys / totalSurveys)*10000)/100)
                data.partitionColor.push( i.partitionColor )
                data.total = totalSurveys
                avgCountryAcc += Math.round( i.kpiModel *100 )/100

                //Set Color
                if(i.kpiModel>86 || i.kpiModel==86){
                    //color verde
                    data.color.push(verde)
                } else if( i.kpiModel <86 && (i.kpiModel > 84 || i.kpiModel == 84)){
                    data.color.push(amarillo)
                } else {
                    data.color.push(rojo)
                }
            }
        }
        let avgCountry = avgCountryAcc / data.values.length
        for(let i of data.values){
            data.avg.push( Math.round( avgCountry *100)/100)
        }
        


        res.status(200).send(data)
    })
}
function kascByModelCountry(req, res){
    let data = {
        values:[], 
        avg:[],
        total:0}
    let dateFrom = parseInt(req.body.fromDate)
    let dateTo = parseInt(req.body.toDate) 
    let group = req.body.group
    Dcsi.aggregate([
        { $match: { date:{$lte:dateTo} }},
        { $match: { date:{$gte:dateFrom} }},
        { $match: { answer:{ $nin:[0]} }},
        { $match:{ cod_dcsi:"BQ010" }},
        { $group:{
            _id:{ vin:{ $substr:["$vin",0,6]}, answer:"$answer", },
            total:{ $sum: 1}
        }},
        { $group:{
            _id:"$_id.vin",
            total:{ $sum:"$total"},
            answer:{ $push:{
                answer:"$_id.answer",
                total:{ $sum:"$total" },
                points:{ $multiply:[ { $sum:"$total" }, "$_id.answer" ]}
            }}
        }},
        { $project:{
            _id:0,
            vin:"$_id",
            model:"",
            kpi:"",
            surveys:"$total",
            maxPoint: "",
            answers:"$answer"
        }}
    ], (err, kasc)=>{
        if(err) return res.status(500).send({message:`Error al consultar KASC MODEL ${err}`})
        //Get KPI
        for(let i of kasc){
            let total = 0
            i.maxPoint = i.surveys * 10
            for(let j of i.answers){
                total += j.points
            }
            i.kpi = Math.round( (total / i.maxPoint)*10000 )/100
        }
        // Set KPI to each VIN
        for(let i of kasc){
            for(let j of models){
                for(let k of j.vin){
                    if(i.vin == k.vin){
                        k.kpi = i.kpi
                        k.surveys = i.surveys
                        i.model = j.model
                    }
                }
            }
        }
        //Get Averages
        let totalSurveys = 0
        for(let i of models){
            let avg = 0; let total = 0
            let surveys = 0
            for(let j of i.vin){
                if(j.kpi){
                    avg += j.kpi
                    total += 1
                    surveys += j.surveys
                } else {

                }
            }
            totalSurveys += surveys
            i.surveys = surveys
            i.kpiModel = avg / total
        }
        //Sort by Surveys
        models.sort( (a, b)=>{
            if(a.surveys > b.surveys){
                return -1;
            }
            if(a.surveys < b.surveys){
                return 1
            }
            return 0
        })
        for(let i=0; i<models.length; i++){
            if( i < 5){
                models[i].partitionColor = verde
            } else if ( i > 4 && i < 10 ){
                models[i].partitionColor = amarillo
            } else {
                models[i].partitionColor = rojo
            }
        }

        let avgCountryAcc = 0
        //Set Data Object and Send :D
        for(let i of models){
            if(!isNaN(i.kpiModel)){

                data.values.push(
                    Math.round( i.kpiModel *100 )/100
                )
                data.total = totalSurveys
                avgCountryAcc += Math.round( i.kpiModel *100 )/100
            }
        }
        let avgCountry = avgCountryAcc / data.values.length
        for(let i of data.values){
            data.avg.push( Math.round( avgCountry *100)/100)
        }
        


        res.status(200).send(data)
    })
}

function frftByModel(req, res){
    let data = {
        labels:[], 
        values:[], 
        color:[], 
        surveys:[], 
        partition:[], 
        partitionColor:[],
        avg:[],
        total:0}

    let dateFrom = parseInt(req.body.fromDate)
    let dateTo = parseInt(req.body.toDate) 
    let group = req.body.group
    Dcsi.aggregate([
        { $match: { date:{$lte:dateTo} }},
        { $match: { date:{$gte:dateFrom} }},
        { $match: { cod_dealer:{$in: group} }},
        { $match: { cod_dcsi:{ $in:["BQ020"]}} },
        { $match: { answer:{ $nin:[0]} }},
        { $group: {
            _id:{ vin:{ $substr:[ "$vin", 0, 6 ]}, answer:"$answer" },
            surveys:{ $sum: 1}
        }},
        { $group: {
            _id:"$_id.vin",
            surveys:{ $sum:"$surveys"},
            answers:{
                $push:{
                    answer:"$_id.answer",
                    total:{ $sum:"$surveys"}
                }
            }
        }},
        { $project:{
            _id:0,
            vin:"$_id",
            kpi:"",
            surveys:"$surveys",
            answers:"$answers"
        }}


    ], (err, frft)=>{
        if(err) return res.status(500).send({message:`Error al consultar el FRFT ${err}`})

        // get FRFT Kpi
        if(frft){
            for(let i of frft){
                for(let j of i.answers){
                    if(j.answer == 1){
                        i.kpi = j.total / i.surveys
                    } else if(j.answer == 2){
                        i.kpi = 1 - (j.total / i.surveys)
                    }
                }
            }
        }
        //Set KPI to each Vin
        for(let i of frft){
            for(let j of models){
                for(let k of j.vin){
                    if(i.vin == k.vin){
                        k.kpi = i.kpi
                        k.surveys = i.surveys
                    }
                }
            }
        }

        //Get Averages
        let totalSurveys = 0
        for(let i of models){
            let avg = 0; let total = 0
            let surveys = 0
            for(let j of i.vin){
                if(j.kpi){
                    // avg += j.kpi
                    total += 1
                    surveys += j.surveys
                }
            }
            totalSurveys += surveys
            i.surveys = surveys
            
            for(let j of i.vin){
                if(j.kpi){
                    avg += j.kpi * (j.surveys/ i.surveys)
                    total += 1
                }
            }
            i.kpiModel = Math.round( avg * 10000)/100
        }

        //Sort by Surveys
        models.sort( (a, b)=>{
            if(a.surveys > b.surveys){
                return -1;
            }
            if(a.surveys < b.surveys){
                return 1
            }
            return 0
        })
        for(let i=0; i<models.length; i++){
            if( i < 5){
                models[i].partitionColor = verde
            } else if ( i > 4 && i < 10 ){
                models[i].partitionColor = amarillo
            } else {
                models[i].partitionColor = rojo
            }
        }
        // Set data Object
        let avgCountryAcc = 0
        for(let i of models){
            if(!isNaN(i.kpiModel) && i.surveys >0 ){

                data.labels.push(i.model)
                data.values.push(
                    Math.round( i.kpiModel *100 )/100
                )
                avgCountryAcc += Math.round( i.kpiModel *100 )/100
                data.surveys.push( i.surveys )
                data.partition.push( Math.round( (i.surveys / totalSurveys)*10000)/100)
                data.partitionColor.push( i.partitionColor )
                data.total = totalSurveys

                //Set Color
                if(i.kpiModel>95 || i.kpiModel==95){
                    //color verde
                    data.color.push(verde)
                } else if( i.kpiModel <95 && (i.kpiModel > 90 || i.kpiModel == 90)){
                    data.color.push(amarillo)
                } else {
                    data.color.push(rojo)
                }
            }
        }
        let avgCountry = avgCountryAcc / data.values.length
        for(let i of data.values){
            data.avg.push( Math.round( avgCountry *100)/100)
        }

        return res.status(200).send(data)
    })
}

function frftByModelCountry(req, res){
    let data = {
        values:[], 
        avg:[] }

    let dateFrom = parseInt(req.body.fromDate)
    let dateTo = parseInt(req.body.toDate) 
    let group = req.body.group
    Dcsi.aggregate([
        { $match: { date:{$lte:dateTo} }},
        { $match: { date:{$gte:dateFrom} }},
        // { $match: { cod_dealer:{$in: group} }},
        { $match: { cod_dcsi:{ $in:["BQ020"]}} },
        { $match: { answer:{ $nin:[0]} }},
        { $group: {
            _id:{ vin:{ $substr:[ "$vin", 0, 6 ]}, answer:"$answer" },
            surveys:{ $sum: 1}
        }},
        { $group: {
            _id:"$_id.vin",
            surveys:{ $sum:"$surveys"},
            answers:{
                $push:{
                    answer:"$_id.answer",
                    total:{ $sum:"$surveys"}
                }
            }
        }},
        { $project:{
            _id:0,
            vin:"$_id",
            kpi:"",
            surveys:"$surveys",
            answers:"$answers"
        }}


    ], (err, frft)=>{
        if(err) return res.status(500).send({message:`Error al consultar el FRFT ${err}`})

        // get FRFT Kpi
        if(frft){
            for(let i of frft){
                for(let j of i.answers){
                    if(j.answer == 1){
                        i.kpi = j.total / i.surveys
                    } else if(j.answer == 2){
                        i.kpi = 1 - (j.total / i.surveys)
                    }
                }
            }
        }
        //Set KPI to each Vin
        for(let i of frft){
            for(let j of models){
                for(let k of j.vin){
                    if(i.vin == k.vin){
                        k.kpi = i.kpi
                        k.surveys = i.surveys
                    }
                }
            }
        }

        //Get Averages
        let totalSurveys = 0
        for(let i of models){
            let avg = 0; let total = 0
            let surveys = 0
            for(let j of i.vin){
                if(j.kpi){
                    // avg += j.kpi
                    total += 1
                    surveys += j.surveys
                }
            }
            totalSurveys += surveys
            i.surveys = surveys
            
            for(let j of i.vin){
                if(j.kpi){
                    avg += j.kpi * (j.surveys/ i.surveys)
                    total += 1
                }
            }
            i.kpiModel = Math.round( avg * 10000)/100
        }

        //Sort by Surveys
        models.sort( (a, b)=>{
            if(a.surveys > b.surveys){
                return -1;
            }
            if(a.surveys < b.surveys){
                return 1
            }
            return 0
        })
        
        // Set data Object
        let avgCountryAcc = 0
        for(let i of models){
            if(!isNaN(i.kpiModel) && i.surveys >0 ){
                data.values.push(
                    Math.round( i.kpiModel *100 )/100
                )
                avgCountryAcc += Math.round( i.kpiModel *100 )/100
                
            }
        }
        let avgCountry = avgCountryAcc / data.values.length
        for(let i of data.values){
            data.avg.push( Math.round( avgCountry *100)/100)
        }

        return res.status(200).send(data)
    })
}

function kacsDetails(req, res){
    let data = {
        labels:[], 
        values:[], 
        color:[], 
        surveys:[], 
        partition:[], 
        partitionColor:[],
        avg:[],
        total:0}
    let dcsi = req.body.dcsi
    let dateFrom = parseInt(req.body.fromDate)
    let dateTo = parseInt(req.body.toDate) 
    let group = req.body.group
    Dcsi.aggregate([
        { $match: { date:{$lte:dateTo} }},
        { $match: { cod_dealer: { $in:group } }},
        { $match: { date:{$gte:dateFrom} }},
        // { $match: { answer:{ $nin:[0]} } },
        { $match: { cod_dcsi: { $in: dcsi } }},
        { $group: {
            _id:{ vin:{ $substr:[ "$vin", 0, 6 ]}, answer:"$answer" },
            surveys:{ $sum: 1}
        }},
        { $group:{
            _id:"$_id.vin",
            surveys:{ $sum: "$surveys" },
            answers:{ $push:{
                answer:"$_id.answer",
                total:"$surveys"
            }}
        }},
        { $project:{
            _id:0,
            vin:"$_id",
            kpi:"",
            surveys:"$surveys",
            answers:"$answers"
        }}

    ], (err, kacs)=>{
        if(err) return res.status(500).send({message:`Error al obtener los detaller del KCAS ${err}`})
        //Get KPI
        for(let i of kacs){
            let acc = 0
            for(let j of i.answers){
                acc += j.answer * j.total
            }
            i.kpi = acc / (i.surveys * 10)
        }

        //Set KPI on each model
        for(let i of models){
            for(let j of i.vin){
                for(let k of kacs){
                    if(k.vin == j.vin){
                        j.surveys = k.surveys
                        j.kpi = k.kpi
                    }
                }
            }
        }


        //Get Averages
        let totalSurveys = 0
        for(let i of models){
            let avg = 0; let total = 0
            let surveys = 0
            for(let j of i.vin){
                if(j.kpi){
                    // avg += j.kpi
                    total += 1
                    surveys += j.surveys
                }
            }
            totalSurveys += surveys
            i.surveys = surveys
            
            for(let j of i.vin){
                if(j.kpi){
                    avg += j.kpi * (j.surveys/ i.surveys)
                    total += 1
                }
            }
            i.kpiModel = Math.round( avg * 10000)/100
        }

        //Sort by Surveys
        models.sort( (a, b)=>{
            if(a.surveys > b.surveys){
                return -1;
            }
            if(a.surveys < b.surveys){
                return 1
            }
            return 0
        })
        for(let i=0; i<models.length; i++){
            if( i < 5){
                models[i].partitionColor = verde
            } else if ( i > 4 && i < 10 ){
                models[i].partitionColor = amarillo
            } else {
                models[i].partitionColor = rojo
            }
        }
        // Set data Object
        let avgCountryAcc = 0
        for(let i of models){
            if(!isNaN(i.kpiModel) && i.surveys >0 ){

                data.labels.push(i.model)
                data.values.push(
                    Math.round( i.kpiModel *100 )/100
                )
                avgCountryAcc += Math.round( i.kpiModel *100 )/100
                data.surveys.push( i.surveys )
                data.partition.push( Math.round( (i.surveys / totalSurveys)*10000)/100)
                data.partitionColor.push( i.partitionColor )
                data.total = totalSurveys

                //Set Color
                if(i.kpiModel>86 || i.kpiModel==86){
                    //color verde
                    data.color.push(verde)
                } else if( i.kpiModel <86 && (i.kpiModel > 84 || i.kpiModel == 84)){
                    data.color.push(amarillo)
                } else {
                    data.color.push(rojo)
                }
            }
        }
        let avgCountry = avgCountryAcc / data.values.length
        for(let i of data.values){
            data.avg.push( Math.round( avgCountry *100)/100)
        }
        res.status(200).send(data)
    })
}

function kacsDetailsCountry(req, res){
    let data = {
        values:[],
        avg:[],
        total:0}
    let dcsi = req.body.dcsi
    let dateFrom = parseInt(req.body.fromDate)
    let dateTo = parseInt(req.body.toDate) 
    let group = req.body.group
    Dcsi.aggregate([
        { $match: { date:{$lte:dateTo} }},
        // { $match: { cod_dealer: { $in:group } }},
        { $match: { date:{$gte:dateFrom} }},
        // { $match: { answer:{ $nin:[0]} } },
        { $match: { cod_dcsi: { $in: dcsi } }},
        { $group: {
            _id:{ vin:{ $substr:[ "$vin", 0, 6 ]}, answer:"$answer" },
            surveys:{ $sum: 1}
        }},
        { $group:{
            _id:"$_id.vin",
            surveys:{ $sum: "$surveys" },
            answers:{ $push:{
                answer:"$_id.answer",
                total:"$surveys"
            }}
        }},
        { $project:{
            _id:0,
            vin:"$_id",
            kpi:"",
            surveys:"$surveys",
            answers:"$answers"
        }}

    ], (err, kacs)=>{
        if(err) return res.status(500).send({message:`Error al obtener los detaller del KCAS ${err}`})
        //Get KPI
        for(let i of kacs){
            let acc = 0
            for(let j of i.answers){
                acc += j.answer * j.total
            }
            i.kpi = acc / (i.surveys * 10)
        }

        //Set KPI on each model
        for(let i of models){
            for(let j of i.vin){
                for(let k of kacs){
                    if(k.vin == j.vin){
                        j.surveys = k.surveys
                        j.kpi = k.kpi
                    }
                }
            }
        }


        //Get Averages
        let totalSurveys = 0
        for(let i of models){
            let avg = 0; let total = 0
            let surveys = 0
            for(let j of i.vin){
                if(j.kpi){
                    // avg += j.kpi
                    total += 1
                    surveys += j.surveys
                }
            }
            totalSurveys += surveys
            i.surveys = surveys
            
            for(let j of i.vin){
                if(j.kpi){
                    avg += j.kpi * (j.surveys/ i.surveys)
                    total += 1
                }
            }
            i.kpiModel = Math.round( avg * 10000)/100
        }

        //Sort by Surveys
        models.sort( (a, b)=>{
            if(a.surveys > b.surveys){
                return -1;
            }
            if(a.surveys < b.surveys){
                return 1
            }
            return 0
        })
        for(let i=0; i<models.length; i++){
            if( i < 5){
                models[i].partitionColor = verde
            } else if ( i > 4 && i < 10 ){
                models[i].partitionColor = amarillo
            } else {
                models[i].partitionColor = rojo
            }
        }
        // Set data Object
        let avgCountryAcc = 0
        for(let i of models){
            if(!isNaN(i.kpiModel) && i.surveys >0 ){

               
                data.values.push(
                    Math.round( i.kpiModel *100 )/100
                )
                avgCountryAcc += Math.round( i.kpiModel *100 )/100
                
                data.total = totalSurveys
            }
        }
        let avgCountry = avgCountryAcc / data.values.length
        for(let i of data.values){
            data.avg.push( Math.round( avgCountry *100)/100)
        }
        res.status(200).send(data)
    })
}
module.exports = {
    getModels,
    getDealer,
    getFilterModel,
    kascByModel,
    kascByModelCountry,
    frftByModel,
    frftByModelCountry,
    kacsDetails,
    kacsDetailsCountry
}