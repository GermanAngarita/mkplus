'use strict'

const BWarranty = require('../models/budget_warranty')
const moment = require('moment')

function createdBWarranty(req){
    const budget = new BWarranty({
        yearmonth: req.body.yearmonth,
        year: req.body.year,
        month: req.body.month,
        budget: req.body.budget
    })

    budget.save( (err)=>{
        if(err) return console.log(err)
        console.log(`Se ha creado presupuesto para: ${req.body.yearmonth}`)
    } )
}
function fakeData(req, res){
    let yearSelect = req.param('year')
    for(let i=0; i<12; i++){
        let year = yearSelect;
        let month = i + 1;
        let yearmonth = moment(year+'/'+month, 'YYYY/MM').format('YYYYMM')
        let data = {
            body:{
                yearmonth:yearmonth,
                year:year,
                month:month,
                budget: Math.round( Math.random() * 1000 )
            }
        }
        createdBWarranty(data)
    }
    res.status(200).send({msg:'Se están creando las fechas'})
}

// fakeData()

module.exports = {
    createdBWarranty,
    fakeData
}