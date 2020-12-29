const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let business = new Schema({
    opsType : {type:String},
    email: {type:String , unique: true,lowercase:true},
    mobile: {type: String},
    businessAddress: {type: String },
    country: {type:String},
    state: {type:String},
    cmp_reg_no: {type: String },
    tax_reg_no: {type: String },
    password: {type:String},
    timeStamp:  { type:Date, default:Date.now },
    blockaddr: {type: String},
    status: {type:String},
    cts : { type:Date, default:Date.now }

})

module.exports = mongoose.model('business',business);

