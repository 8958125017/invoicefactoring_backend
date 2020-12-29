const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let invoice = new Schema({
    opsType:{type:String},    
    id:  { type: String, unique: true},
    issuingCompanyEmail: {type:String ,lowercase:true},
    purchasingCompanyEmail: {type:String ,lowercase:true},
    totalInvoiceAmount: {type:String},   
    invoice: { type: Array } ,
    nodalcompanyEmail: {type:String ,lowercase:true},
    nodalReceipt: {type:String},
    lendingAmount: {type:String},
    lenderEmail: {type:String, lowercase: true},
    lendingInterest: {type:String},
    dateOfPayment: {type:String},
    // purchaseAddress: {type:String},
    // timeStamp: { type:Date, default:Date.now },
    // issuingAddress: {type:String},
    // purchaingAddress: {type:String},
    sts: {type:String}, //0-rejected, 1-raised, 2-accpeted by buyer, 3- send to lender, 4- rejected by lender, 5 - processed by lender
    // mob_num: {type:String},
    pubBlockaddr : {type: String},
    cts : { type:Date, default:Date.now },   
    buts : { type:Date },   
    suts : { type:Date},   
    luts : { type:Date},   

})

module.exports = mongoose.model('invoice',invoice);
