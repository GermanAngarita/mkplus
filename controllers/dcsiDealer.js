'use strict'

const DCSI = require('../models/dcsi');

let scale = {
    high:86,
    medium:69,
    low:55,
    very_low:0,
} 
let loyaltyScale = {
    high:44,
    medium:40,
    low:39,
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
        return allColors.colors.low
    }
} 

// DCSI Conclusiones / Cierres
function satisfactionPeriodPos(req, res){
    let type = req.body.type;
    let dealer = req.body.dealer;
    let periods = parseInt(req.body.periods);
    let dcsi = '';
    let data = { labels:[], value:[], surveys:[], devStd:[], color:[] }
    if(type=='SE'){
        dcsi='BQ010'
    }else if(type=='SA'){
        dcsi='BQ030'
    }

    DCSI.aggregate([
        { $match:{ cod_dealer:dealer }},
        { $match:{ type:type }},
        { $match:{ cod_dcsi:dcsi }},
        { $group:{
            _id:{ date:{ $substr:["$date", 0, 6]} },
            value:{ $avg:"$answer"},
            surveys:{ $sum:1},
            devStd:{ $stdDevPop: "$answer" } 
        }},
        { $project:{
            _id:0,
            date:"$_id.date",
            value:"$value",
            surveys:"$surveys",
            devStd:"$devStd"
        }},
        { $sort:{ date:-1}},
        { $limit:periods},
        { $sort:{ date:1}},

    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        if(result){
            for(let i of result){
                 data.labels.push(i.date);
                 data.value.push(Math.round(i.value*100)/10);
                 data.surveys.push(i.surveys);
                 data.devStd.push( Math.round(i.devStd*100)/10);
                 data.color.push( setColor(Math.round(i.value*100)/10, scale))
            }
            res.status(200).send(data)
        } else {
            res.status(200).send(data)
        }
    })
}

function satisfactionPeriodPosCountry(req, res){
    let type = req.body.type;
    let periods = parseInt(req.body.periods);
    let dcsi = '';
    let data = { labels:[], value:[], surveys:[], devStd:[], color:[] }
    if(type=='SE'){
        dcsi='BQ010'
    }else if(type=='SA'){
        dcsi='BQ030'
    }

    DCSI.aggregate([
        { $match:{ type:type }},
        { $match:{ cod_dcsi:dcsi }},
        { $group:{
            _id:{ date:{ $substr:["$date", 0, 6]} },
            value:{ $avg:"$answer"},
            surveys:{ $sum:1},
            devStd:{ $stdDevPop: "$answer" } 
        }},
        { $project:{
            _id:0,
            date:"$_id.date",
            value:"$value",
            surveys:"$surveys",
            devStd:"$devStd"
        }},
        { $sort:{ date:-1}},
        { $limit:periods},
        { $sort:{ date:1}}
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        if(result){
            for(let i of result){
                 data.labels.push(i.date);
                 data.value.push(Math.round(i.value*100)/10);
                 data.surveys.push(i.surveys);
                 data.devStd.push( Math.round(i.devStd*100)/10);
                 data.color.push( setColor(Math.round(i.value*100)/10, scale))
            }
            res.status(200).send(data)
        } else {
            res.status(200).send(data)
        }
    })
}

function recommendPeriodPos(req, res){
    let type = req.body.type;
    let dealer = req.body.dealer;
    let periods = parseInt(req.body.periods);
    let dcsi = 'CQ010';
    let data = { labels:[], value:[], surveys:[], devStd:[], color:[] }

    DCSI.aggregate([
        { $match:{ cod_dealer:dealer }},
        { $match:{ type:type }},
        { $match:{ cod_dcsi:dcsi }},
        { $group:{
            _id:{ date:{ $substr:["$date", 0, 6]} },
            value:{ $avg:"$answer"},
            surveys:{ $sum:1},
            devStd:{ $stdDevPop: "$answer" } 
        }},
        { $project:{
            _id:0,
            date:"$_id.date",
            value:"$value",
            surveys:"$surveys",
            devStd:"$devStd"
        }},
        { $sort:{ date:-1}},
        { $limit:periods},
        { $sort:{ date:1}}
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        if(result){
            for(let i of result){
                 data.labels.push(i.date);
                 data.value.push(Math.round(i.value*100)/10);
                 data.surveys.push(i.surveys);
                 data.devStd.push( Math.round(i.devStd*100)/10);
                 data.color.push( setColor(Math.round(i.value*100)/10, scale))
            }
            res.status(200).send(data)
        } else {
            res.status(200).send(data)
        }
    })
}

function recommendPeriodPosCountry(req, res){
    let type = req.body.type;
    let periods = parseInt(req.body.periods);
    let dcsi = 'CQ010';
    let data = { labels:[], value:[], surveys:[], devStd:[], color:[] }

    DCSI.aggregate([
        { $match:{ type:type }},
        { $match:{ cod_dcsi:dcsi }},
        { $group:{
            _id:{ date:{ $substr:["$date", 0, 6]} },
            value:{ $avg:"$answer"},
            surveys:{ $sum:1},
            devStd:{ $stdDevPop: "$answer" } 
        }},
        { $project:{
            _id:0,
            date:"$_id.date",
            value:"$value",
            surveys:"$surveys",
            devStd:"$devStd"
        }},
        { $sort:{ date:-1}},
        { $limit:periods},
        { $sort:{ date:1}}
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        if(result){
            for(let i of result){
                 data.labels.push(i.date);
                 data.value.push(Math.round(i.value*100)/10);
                 data.surveys.push(i.surveys);
                 data.devStd.push( Math.round(i.devStd*100)/10);
                 data.color.push( setColor(Math.round(i.value*100)/10, scale))
            }
            res.status(200).send(data)
        } else {
            res.status(200).send(data)
        }
    })
}

function retentionPeriodPos(req, res){
    let type = req.body.type;
    let dealer = req.body.dealer;
    let periods = parseInt(req.body.periods);
    let dcsi = 'CQ020';
    let data = { labels:[], value:[], surveys:[], devStd:[], color:[] }

    DCSI.aggregate([
        { $match:{ cod_dealer:dealer }},
        { $match:{ type:type }},
        { $match:{ cod_dcsi:dcsi }},
        { $group:{
            _id:{ date:{ $substr:["$date", 0, 6]} },
            value:{ $avg:"$answer"},
            surveys:{ $sum:1},
            devStd:{ $stdDevPop: "$answer" } 
        }},
        { $project:{
            _id:0,
            date:"$_id.date",
            value:"$value",
            surveys:"$surveys",
            devStd:"$devStd"
        }},
        { $sort:{ date:-1}},
        { $limit:periods},
        { $sort:{ date:1}}
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        if(result){
            for(let i of result){
                 data.labels.push(i.date);
                 data.value.push(Math.round(i.value*100)/10);
                 data.surveys.push(i.surveys);
                 data.devStd.push( Math.round(i.devStd*100)/10);
                 data.color.push( setColor(Math.round(i.value*100)/10, scale))
            }
            res.status(200).send(data)
        } else {
            res.status(200).send(data)
        }
    })
}

function retentionPeriodPosCountry(req, res){
    let type = req.body.type;
    let periods = parseInt(req.body.periods);
    let dcsi = 'CQ020';
    let data = { labels:[], value:[], surveys:[], devStd:[], color:[] }

    DCSI.aggregate([
        { $match:{ type:type }},
        { $match:{ cod_dcsi:dcsi }},
        { $group:{
            _id:{ date:{ $substr:["$date", 0, 6]} },
            value:{ $avg:"$answer"},
            surveys:{ $sum:1},
            devStd:{ $stdDevPop: "$answer" } 
        }},
        { $project:{
            _id:0,
            date:"$_id.date",
            value:"$value",
            surveys:"$surveys",
            devStd:"$devStd"
        }},
        { $sort:{ date:-1}},
        { $limit:periods},
        { $sort:{ date:1}}
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        if(result){
            for(let i of result){
                 data.labels.push(i.date);
                 data.value.push(Math.round(i.value*100)/10);
                 data.surveys.push(i.surveys);
                 data.devStd.push( Math.round(i.devStd*100)/10);
                 data.color.push( setColor(Math.round(i.value*100)/10, scale))
            }
            res.status(200).send(data)
        } else {
            res.status(200).send(data)
        }
    })
}

function loyaltyPeriodPos(req, res){
    let type = req.body.type;
    let dealer = req.body.dealer;
    let periods = parseInt(req.body.periods);
    let dcsi = [];
    let data = { labels:[], value:[], surveys:[], devStd:[], color:[] }
    if(type=='SE'){
        dcsi=['BQ010', 'CQ010', 'CQ020']
    }else if(type=='SA'){
        dcsi=['BQ030', 'CQ010', 'CQ020']
    }

    DCSI.aggregate([
        { $match:{ cod_dealer:dealer }},
        { $match:{ type:type }},
        { $match:{ cod_dcsi:{ $in:dcsi } }},
        { $group:{
            _id:{ date:{ $substr:["$date", 0, 6]}, dcsi:"$cod_dcsi", answer:"$answer", vin:"$vin", evaluation:{ $cond:[ { $gte:["$answer", 9 ]}, 1, 0 ] } },
            logs:{ $sum: 1 }
        }},
        { $group:{
            _id:{ date:"$_id.date", vin:"$_id.vin" },
            dcsi:{ $push:{
                dcsi:"$_id.dcsi",
                answer:"$_id.answer",
                evaluation:{ $cond:[ { $gte:["$_id.answer", 9 ]}, 1, 0 ] }
            } },
            logs:{ $sum:"$_id.evaluation"}
        }},
        { $project:{
            _id:0,
            date:"$_id.date",
            vin:"$_id.vin",
            log:{ $sum:1 },
            loyalty:{ $cond:[ { $eq:["$logs", 3 ]}, 1, 0 ] }
        }},
        { $group:{
            _id:"$date",
            loyalty:{ $sum:"$loyalty"},
            log:{ $sum:"$log"}
        }},
        { $project:{
            _id:0,
            date:"$_id",
            loyalty:"$loyalty",
            logs:"$log",
            value:{ $divide:["$loyalty", "$log" ]}

        }},
        { $sort:{ date:-1}},
        { $limit:periods},
        { $sort:{ date:1}}
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        if(result){
            for(let i of result){
                data.labels.push(i.date);
                data.value.push( Math.round(i.value * 10000)/100);
                data.surveys.push(i.logs)
                data.color.push( setColor(Math.round(i.value * 10000)/100, loyaltyScale) )
            }
            
            res.status(200).send(data)
        }
    })

}

function loyaltyPeriodPosCountry(req, res){
    let type = req.body.type;
    
    let periods = parseInt(req.body.periods);
    let dcsi = [];
    let data = { labels:[], value:[], surveys:[], devStd:[], color:[] }
    if(type=='SE'){
        dcsi=['BQ010', 'CQ010', 'CQ020']
    }else if(type=='SA'){
        dcsi=['BQ030', 'CQ010', 'CQ020']
    }

    DCSI.aggregate([
        { $match:{ type:type }},
        { $match:{ cod_dcsi:{ $in:dcsi } }},
        { $group:{
            _id:{ date:{ $substr:["$date", 0, 6]}, dcsi:"$cod_dcsi", answer:"$answer", vin:"$vin", evaluation:{ $cond:[ { $gte:["$answer", 9 ]}, 1, 0 ] } },
            logs:{ $sum: 1 }
        }},
        { $group:{
            _id:{ date:"$_id.date", vin:"$_id.vin" },
            dcsi:{ $push:{
                dcsi:"$_id.dcsi",
                answer:"$_id.answer",
                evaluation:{ $cond:[ { $gte:["$_id.answer", 9 ]}, 1, 0 ] }
            } },
            logs:{ $sum:"$_id.evaluation"}
        }},
        { $project:{
            _id:0,
            date:"$_id.date",
            vin:"$_id.vin",
            log:{ $sum:1 },
            loyalty:{ $cond:[ { $eq:["$logs", 3 ]}, 1, 0 ] }
        }},
        { $group:{
            _id:"$date",
            loyalty:{ $sum:"$loyalty"},
            log:{ $sum:"$log"}
        }},
        { $project:{
            _id:0,
            date:"$_id",
            loyalty:"$loyalty",
            logs:"$log",
            value:{ $divide:["$loyalty", "$log" ]}

        }},
        { $sort:{ date:-1}},
        { $limit:periods},
        { $sort:{ date:1}}
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        if(result){
            for(let i of result){
                data.labels.push(i.date);
                data.value.push( Math.round(i.value * 10000)/100);
                data.surveys.push(i.logs)
                data.color.push( setColor(Math.round(i.value * 10000)/100, loyaltyScale) )
            }
            
            res.status(200).send(data)
        }
    })
}

// DCSI Poblacional
function populationGener(req, res){
    let type = req.body.type;
    let dealer = req.body.dealer;
    let periods = parseInt(req.body.periods);
    let dcsi = 'BF010';
    let data = { labels:[], value:[], female:[], surveys:[], malePercent:[], femalePercent:[]  }
    DCSI.aggregate([
        { $match:{ type:type } },
        { $match:{ cod_dcsi:dcsi }},
        { $match:{ cod_dealer:dealer }},
        { $group:{
            _id:{ date:{ $substr:[ "$date", 0, 6 ] } },
            male:{ $sum:{ $cond:[ { $eq:["$answer", 1 ]}, 1, 0 ] }},
            female:{ $sum:{ $cond:[ { $eq:["$answer", 2 ]}, 1, 0 ] }},
            logs:{ $sum: 1 }
        }},
        { $project:{
            _id:0,
            date:"$_id.date",
            male:"$male",
            female:"$female",
            surveys:"$logs"
        }},
        { $sort:{ date:-1}},
        { $limit:periods},
        { $sort:{ date:1}}
    ], (err, result)=>{
        if(err) return res.status(500).send(err)
        if(result){ 
            for(let i of result){
                data.labels.push(i.date);
                data.value.push(i.male);
                data.female.push(i.female);
                data.surveys.push(i.surveys)
                data.malePercent.push( Math.round( i.male/i.surveys * 10000 )/100 );
                data.femalePercent.push( Math.round(i.female/i.surveys * 10000)/100 ); 
            }
            res.status(200).send(data)
        }
    })
}

function populationAge(req, res){
    let type = req.body.type;
    let dealer = req.body.dealer;
    let periods = parseInt(req.body.periods);
    let dcsi = 'BF020';
    let data = { labels:[], ageRange:[], surveys:[], first:[], second:[], third:[], quarter:[], fifth:[], sixth:[]  }

    DCSI.aggregate([
        { $match:{ type:type } },
        { $match:{ cod_dcsi:dcsi }},
        { $match:{ cod_dealer:dealer }},
        { $group:{
            _id:{ date:{ $substr:["$date", 0, 6] } },
            first:{ $sum:{ $cond:[ { $eq:["$answer", 1] }, 1, 0 ] } },
            second:{ $sum:{ $cond:[ { $eq:["$answer", 2] }, 1, 0 ] } },
            third:{ $sum:{ $cond:[ { $eq:["$answer", 3] }, 1, 0 ] } },
            quarter:{ $sum:{ $cond:[ { $eq:["$answer", 4] }, 1, 0 ] } },
            fifth:{ $sum:{ $cond:[ { $eq:["$answer", 5] }, 1, 0 ] } },
            sixth:{ $sum:{ $cond:[ { $eq:["$answer", 6] }, 1, 0 ] } },

            logs:{ $sum:1}
        }},
        { $project:{
            _id:0,
            date:"$_id.date",
            first:"$first",
            second:"$second",
            third:"$third",
            quarter:"$quarter",
            fifth:"$fifth",
            sixth:"$sixth",
            logs:"$logs"
        }},
        { $sort:{ date:-1}},
        { $limit:periods},
        { $sort:{ date:1}}
    ], (err, result)=>{
        if(err) return res.status(500).send(err);
        if(result){
            for(let i of result){
                data.labels.push(i.date);
                data.first.push(i.first);
                data.second.push(i.second);
                data.third.push(i.third);
                data.quarter.push(i.quarter);
                data.fifth.push(i.fifth);
                data.sixth.push(i.sixth);
                data.surveys.push(i.logs)
            }
            res.status(200).send(data)
        }
    })
}

module.exports = {
    satisfactionPeriodPos,
    satisfactionPeriodPosCountry,

    recommendPeriodPos,
    recommendPeriodPosCountry,

    retentionPeriodPos,
    retentionPeriodPosCountry,

    loyaltyPeriodPos,
    loyaltyPeriodPosCountry,

    populationGener,
    populationAge
}