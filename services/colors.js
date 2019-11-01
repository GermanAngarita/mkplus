'use strict'

const colors = {
    hight:'#77F186',
    medium:'#F9EA2B',
    low:'#FA98AD',
    very_low:'#DF3A01'
}

 const oldScale = {
    high:86,
    medium:69,
    low:55,
    very_low:0,
 }
 let oldLoyaltyScale = {
    high:44,
    medium:40,
    low:39,
    very_low:0,
}

//  satisfaccion, lavado, sala launge
 const newScale = {
    high:92,
    medium:86,
    low:80,
    very_low:0,
 }
const loyaltyScale = {
    high:57,
    medium:50,
    low:43,
    very_low:0,
}

// Service Express
 const serviceExpress = {
    high:70,
    medium:63,
    low:56,
    very_low:0,
 }

 const transporte = {
    high:80,
    medium:73,
    low:66,
    very_low:0,
 }

 function getColor(type, date, question, value){
     
     console.log(type)
     console.log(date)
     console.log(question)
     console.log(value)

     if(type === 'SE'){
        if(date > 20190800){
            console.log('Paso el if de la fecha')
            // Nuevos indicadores
            switch(question){
                case 'BQ010':
                    if(value >= newScale.high){
                        return colors.hight
                    } else if( value >= newScale.medium && value < newScale.high){
                        return colors.medium
                    } else {
                        return colors.low
                    }
                    break;
                // Limpieza del vehículo
                case 'SQ090':
                    if(value >= newScale.high){
                        return colors.hight
                    } else if( value >= newScale.medium && value < newScale.high){
                        return colors.medium
                    } else {
                        return colors.low
                    }
                    break;
                // Sala launge
                case 'SQ170':
                        if(value >= newScale.high){
                            return colors.hight
                        } else if( value >= newScale.medium && value < newScale.high){
                            return colors.medium
                        } else {
                            return colors.low
                        }
                        break;
                // Lealtad
                case 'loyalty':
                    if(value >= loyaltyScale.high){
                        return colors.hight
                    } else if( value >= loyaltyScale.medium && value < loyaltyScale.high){
                        return colors.medium
                    } else {
                        return colors.low
                    }
                    break;

                // Servicio Express    
                case 'SQ140':
                    if(value >= serviceExpress.high){
                        return colors.hight
                    } else if( value >= serviceExpress.medium && value < serviceExpress.high){
                        return colors.medium
                    } else {
                        return colors.low
                    }
                // Llamada de seguimiento
                case 'SQ120':
                    if(value >= transporte.high){
                        return colors.hight
                    } else if( value >= transporte.medium && value < transporte.high){
                        return colors.medium
                    } else {
                        return colors.low
                    }
                    break;
                // Solucion de transporte
                case 'SQ150':
                        if(value >= transporte.high){
                            return colors.hight
                        } else if( value >= transporte.medium && value < transporte.high){
                            return colors.medium
                        } else {
                            return colors.low
                        }
                        break;
                default:
                    if(value >= oldScale.high){
                        return colors.hight
                    } else if( value >= oldScale.medium && value < oldScale.high){
                        return colors.medium
                    } else {
                        return colors.low
                    }
            }

        } else {
            //Antiguos Indicadores
            switch(question){
                case 'BQ010':
                    if(value >= oldScale.high){
                        return colors.hight
                    } else if( value >= oldScale.medium && value < oldScale.high){
                        return colors.medium
                    } else {
                        return colors.low
                    }
                break;
                case 'loyalty':
                    if(value >= oldLoyaltyScale.high){
                        return colors.hight
                    } else if( value >= oldLoyaltyScale.medium && value < oldLoyaltyScale.high){
                        return colors.medium
                    } else {
                        return colors.low
                    }
                break;
                default:
                    if(value >= oldScale.high){
                        return colors.hight
                    } else if( value >= oldScale.medium && value < oldScale.high){
                        return colors.medium
                    } else {
                        return colors.low
                    }
            }

        }

     } else {
        //  Indicadores Comercial
        if(question === 'loyalty'){
            if(value >= oldLoyaltyScale.high){
                return colors.hight
            } else if( value >= oldLoyaltyScale.medium && value < oldLoyaltyScale.high){
                return colors.medium
            } else {
                return colors.low
            }
        } else {
            if(value >= oldScale.high){
                return colors.hight
            } else if( value >= oldScale.medium && value < oldScale.high){
                return colors.medium
            } else {
                return colors.low
            }
        }
        
     }
 }

 module.exports = {
     getColor
 }


 

