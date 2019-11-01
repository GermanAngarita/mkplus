'use steict'
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const moment = require('moment')
const VinHistory = require('../models/vin_history')
const Vin = require('../models/vin')
const Model = require('../models/model')
const Tickets = require('../models/ticket')


let modelsCod = [];
let kmByModel = [];
let media = []




if(modelsCod.length==0){
    let dateInit = new Date(moment(moment().subtract(1, 'year').format('YYYY').toString()+'0101', 'YYYYMMDD').format())
    let dateEnd = new Date(moment(moment().subtract(1, 'year').format('YYYY').toString()+'1231', 'YYYYMMDD').format())

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
        if(err) return console.log({msg:'Lo sentimos ocurrió un error al obtener los modelos', err:err})
        modelsCod = models
        Tickets.aggregate([
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
            if(err) return console.log({msg:'Ocurrió un error al obtener los datos por modelo', err:err})
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
                kmByModel = data;
            } else {
                console.log({msg:'No se encontraron datos'})
            }
        })
    })
    
}

// getMediaOnMonthsToIn()

//Calculo de la Media de meses que toma un vehículo en ingresar al taller por mantenimiento
function getMediaOnMonthsToIn(){
    Tickets.aggregate([
        { $match:{ avgKmtMonth:{ $exists:true, $nin:[null, 0, Infinity] } } },
        { $match:{ monthsOnWay:{ $exists:true, $nin:[null, 0, Infinity], $gt:0, $lte:60 } }},
        { $match:{ typeIn:{ $in:[/MTO/] } }},
        { $group:{
            _id:{ vin:"$vin"},
            months:{ $avg:"$monthsOnWay"},
            frequency:{ $sum:1 },
            kilometers:{ $avg:"$kilometers" },
        } },
        { $project:{
            _id:0,
            vin:"$_id.vin",
            months:"$months",
            frequency:"$frequency",
            kilometers:"$kilometers",
            mto: { $multiply:[ { $floor:{ $divide:[ { $divide:[ { $add:["$kilometers", 0.5] }, 1000 ] }, 5 ] } }, 5 ] }
        }},
        { $group:{
            _id:"$mto",
            avg_month:{ $avg:"$months" },
            std_desv_month:{ $stdDevPop:"$months" },
            units:{ $sum:"$frequency" },
            data:{ $push: "$months" }
        }},
        { $project:{
            _id:0,
            mto:"$_id",
            avg_month:"$avg_month",
            std_desv_month:"$std_desv_month",
            variance:{ $pow:[ "$std_desv_month", 2 ]},
            units:"$units"
        }},
        { $sort:{ mto:1 } },
        { $limit:30}
        
    ], (err, result)=>{
        if(err) console.log(err)
        media = result;
        console.log(result)
    })
}

// Conteo de VIN
function getCountVinByYears(req, res){
    let dateInit = new Date(moment('01/12/2018', 'DD/MM/YYYY').format());
    let year_operation = req.body.year
    Vin.aggregate([
        { $match:{ dealer_cod:{ $nin:['OTHERSWWW'] } }},
        { $match: { date_init_warranty:{ $lte: dateInit} } },
        { $project:{
            vin:"$vin",
            year_operation: { $trunc: { $divide:[ {$subtract:[ dateInit, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } }
        } },
        { $match:{ "year_operation":{ $eq: year_operation } }}
    ], (err, result)=>{
        if(err) return res.status(200).send({msg:'Lo sentimos ocurrión un error al obtener el conteo de Vin'})
        res.status(200).send({count:result.length, value:0, year:year_operation, vin:result})
    })
}

// Cálculos manuales

function setVinHistoryManual(req, res){
    let dateInit = new Date(moment('01/12/2018', 'DD/MM/YYYY').format());
    let vinToFind = req.body.vin.vin;
    Vin.aggregate([
        { $match:{ vin:vinToFind }},
        { $match:{ dealer_cod:{ $nin:['OTHERSWWW'] } }},
        { $match: { date_init_warranty:{ $lte: dateInit} } },
        { $project:{
            vin:"$vin",
            model_alt:"$model_alt",
            origin:"$origin",
            year:"$year",
            date_init_warranty:"$date_init_warranty",
            duration_warranty:"$warranty_duration",
            use_type:{ $cond:[ { $gt:["$warranty_duration", 730] }, "PARTICULAR", "PUBLICO" ] },
            cl_sales:"$dealer_cod",
            article:"$article",
            article_description:"$article_description",
            year_operation: { $trunc: { $divide:[ {$subtract:[ dateInit, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } },
            vsr: { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateInit, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 0 ] }, 
                    1, 
                    { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateInit, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 1 ] },
                        0.99,
                        { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateInit, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 2 ] },
                            0.97,
                            { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateInit, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 3 ] },
                                0.94,
                                { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateInit, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 4 ] },
                                    0.88,
                                    { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateInit, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 5 ] },
                                        0.8,
                                        { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateInit, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 6 ] },
                                            0.69,
                                            { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateInit, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 7 ] },
                                                0.56,
                                                { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateInit, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 8 ] },
                                                    0.44,
                                                    { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateInit, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 9 ] },
                                                        0.32,
                                                        { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateInit, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 10 ] },
                                                            0.21,
                                                            { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateInit, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 11 ] },
                                                                0.14,
                                                                { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateInit, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 12 ] },
                                                                    0.06,
                                                                    { $cond:[ { $eq:[ { $trunc: { $divide:[ {$subtract:[ dateInit, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 13 ] },
                                                                        0,
                                                                        { $cond:[ { $gt:[ { $trunc: { $divide:[ {$subtract:[ dateInit, "$date_init_warranty" ]}, {$multiply:[1000, 60, 60, 24, 30, 12]} ] } } , 13 ] },
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
                ]}
        } }
    ], (err, result)=>{
        if(err) return res.status(200).send({msg:'Los entimos ocurrió un error al obtener los datos', err:err})
        if(result && result.length>0){
            for(let vin of result){
                let mtos = [{
                    type: 'MTO_1',
                    date: '',
                    kmts: '',
                    cl: '',
                    k:1
                }]
                for(let i=1; i<31; i++){
                    
                    mtos.push({
                        type: 'MTO_'+(i * 5).toString(),
                        date: '',
                        kmts: '',
                        cl: '',
                        k:i * 5
                    })
                }
                let dataVin = new VinHistory({
                    vin:vin.vin,
                    cod_model:'',
                    model_alt: vin.model_alt,
                    origin: vin.origin,
                    year: vin.year,
                    date_init_warranty: vin.date_init_warranty,
                    duration_warranty: vin.duration_warranty,
                    use_type: vin.use_type,
                    km_avg_calculated:0,
                    km_avg_estimate:0,
                    cl_sales: vin.cl_sales,
                    article: vin.article,
                    article_description: vin.article_description,
                    year_operation: vin.year_operation,
                    vsr: vin.vsr,
                    mto_history:mtos, 
                    mto_projection:mtos,
                    // createup: new Date(moment().format()),
                    update:new Date(moment().format())
                })
                for(let i of kmByModel){
                    for(let j of i.models){
                        for(let k of j.vins){
                            if(dataVin.vin.substr(0, 6) == k.vin){
                                dataVin.cod_model = j.model;
                                dataVin.km_avg_estimate = j.avg;
                            }
                        }
                    }
                }

                Tickets.find({vin:vin.vin}, (err, tickets)=>{
                    if(err) console.log(err);
                    if(tickets && tickets.length>0){
                        
                        let avgKm = []
                        for(let j of tickets ){
                            avgKm.push({
                                dateIn:j.bill_date,
                                kmts:j.kilometers,
                                months: parseInt(moment(j.bill_date).diff(dataVin.date_init_warranty)) / (1000 * 60 * 60 * 24 * 30),
                                avg: j.kilometers / (parseInt(moment(j.bill_date).diff(dataVin.date_init_warranty)) / (1000 * 60 * 60 * 24 * 30)),
                            })


                            if(dataVin.ticket_history && dataVin.ticket_history.length>0){
                                let duplies = false
                                for(let k of dataVin.ticket_history){
                                    if(k.kmts == j.kilometers && k.type == j.typeIn){
                                        duplies = true;
                                    }
                                }
                                if(!duplies){
                                    dataVin.ticket_history.push({
                                        cl: j.dealer_cod,
                                        kmts: j.kilometers,
                                        date: j.bill_date,
                                        type: j.typeIn
                                    })
                                }
                            } else {
                                dataVin.ticket_history.push({
                                    cl: j.dealer_cod,
                                    kmts: j.kilometers,
                                    date: j.bill_date,
                                    type: j.typeIn
                                })
                            }
                            
                            if(j.typeIn.split('MTO').length>1){
                                let typeMTO = ''
                                typeMTO = Math.round( ((j.kilometers / 1000) / 5) ) * 5
                            
                                for(let k of dataVin.mto_history){
                                    if(typeMTO==k.k){
                                        k.cl = j.dealer_cod;
                                        k.kmts = j.kilometers;
                                        k.date = j.bill_date;
                                    }

                                }
                            }

                            dataVin.last_ticket.date = j.bill_date;
                            dataVin.last_ticket.km = j.kilometers;
                            dataVin.last_ticket.monthsOnWay = Math.round(moment(j.bill_date).diff(dataVin.date_init_warranty) / (1000 * 60 * 60 * 24 * 30))
                            dataVin.last_ticket.cl = j.dealer_cod;
                            dataVin.last_ticket.type = j.typeIn;
                        }
                        let sum = 0
                        for(let avg of avgKm){
                            sum += avg.avg
                        }
                        dataVin.km_avg_calculated = sum / avgKm.length

                        
                        VinHistory.findOne({vin:dataVin.vin}, (err, find)=>{
                            if(err) res.status(500).send({msg:'Los entimos ocurrió un error al obtener los datos', err:err})
                            if(find){
                                
                                dataVin.update = new Date(moment().format())
            
            
                                VinHistory.findByIdAndUpdate(find._id, dataVin, (err, result)=>{
                                    if(err) console.log(err)
                                    res.status(200).send({msg:`${dataVin.vin} actualizado`})
                                })
                            } else {
                                dataVin.save( (err)=>{
                                    if(err) console.log(err)
                                    res.status(200).send({msg:`${dataVin.vin} creado`})
                                })
                            }
                        })
                    } else {
                        VinHistory.findOne({vin:dataVin.vin}, (err, find)=>{
                            if(err) res.status(500).send({msg:'Los entimos ocurrió un error al obtener los datos', err:err})
                            if(find){
                                
                                dataVin.update = new Date(moment().format())
            
            
                                VinHistory.findByIdAndUpdate(find._id, dataVin, (err, result)=>{
                                    if(err) console.log(err)
                                    res.status(200).send({msg:`${dataVin.vin} actualizado`})
                                })
                            } else {
                                dataVin.save( (err)=>{
                                    if(err) console.log(err)
                                    res.status(200).send({msg:`${dataVin.vin} creado`})
                                })
                            }
                        })
                    }

                }).sort({kilometers:1})
            }

        } else {
            res.status(200).send({msg:'No se encontró este Vin'})
        }
    })
}

module.exports = {
    // getVinAndSetHistory,
    // addRegIntToVin,
    getCountVinByYears,
    setVinHistoryManual,
    
}