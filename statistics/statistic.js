'use strict'

function avg(data){
    let n = data.length;
    let sum = 0;
    let avg_object = []
    let avg_value = 0
    for(let i of data){
        if(isNaN(i)){
            sum = 0 + sum
        } else {
            sum = i + sum
        }
    }
    if(sum == 0){
        avg_value = 0
    } else {
        avg_value = Math.round( ((sum / n)*100)/100 )
    }
    for(let i=0; i<data.length; i++){
        avg_object.push(avg_value)
    }
    return avg_object
}

function avg_mobile(data){
    let n = data.length
    let avg_mobile_object = [null]
    for(let i=0; i<data.length; i++){
        if(isNaN(data[i])){
            data[i] = 0;
        }
    }
    for(let i=0; i<data.length; i++){
        avg_mobile_object.push( Math.round( ((data[i] + data[i+1])/2)*100 )/100 )
    }

    return avg_mobile_object
}

function dev_stand(data){
    let n = data.length;
    let x = avg_value(data)
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

function avg_value(data){
    //Devuelve el promedio de una serie de datos
    let n = data.length;
    let sum = 0
    for(let i of data){
        if(isNan(i)){
            sum = 0 + sum
        } else {
            sum = i + sum
        }
    }
    return sum/n
}

module.exports = {
    avg,
    avg_value,
    avg_mobile
}