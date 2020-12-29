const async = require('async');
const bcrypt = require('bcrypt-nodejs');
const business = require('../models/business');
const config = require('../helpers/config')
const Helpers = require('../helpers/helper')
const invoice = require('../models/invoice');
const invoiceData =require('../models/invoice_Data');
const multichain = require('../helpers/multichain')
const multichainCredential = config.credentials;

async function signup (req,res){
    if (!req.body.opsType) return res.send({statusCode:400,message:"Company type is missing"});
	  if (!req.body.email) return res.send({statusCode:400,message:"Email Id is missing."});
    if (!req.body.businessAddress) return res.send({statusCode:400,message:"Business Address is missing."});
    if (!req.body.cmp_reg_no) return res.send({statusCode:400,message:"cmp_reg_no  is missing."});
    if (!req.body.tax_reg_no) return res.send({statusCode:400,message:"tax_reg_no  is missing."});
    if (!req.body.password) return res.send({statusCode:400,message:"password  is missing."});

    try{
      let hashPassword = await Helpers.hashPasswordfn(req.body.password);
      req.body["password"] = hashPassword;
      req.body["blockaddr"] = await multichain.getNewAddressandpermissionOnMultichain();
      let mdata = await business.create(req.body);
      delete req.body.password
	  	let publish = await multichainCredential.publishFrom({
		            from:config.adminAddress,
		            stream:"enterprises",
		            key:req.body.blockaddr,
		            data: {"json":req.body}
		          })
	  	return res.send({statusCode:200,message:"Company has been Successfully registered."})
      console.log('[success][business][signup]: Request blockaddr --> ',publish);
    }
    catch(err)
    {
      console.log('[error][business][signup]: error --> ', err.code);
      if(err.code ==11000) return res.send({statusCode:500,message:"Record with the Email or tax registration number already exist"});
      return res.send({statusCode:500,message:"Something went wrong."});
    }
}

async function login (req,res){
	if (!req.body.email) return res.send({statusCode:400,message:"Email Id is missing."});
  if (!req.body.password) return res.send({statusCode:400,message:"Password is missing."});
  if (!req.body.opsType) return res.send({statusCode:400,message:"Opstype is missing."});
  let hashPassword = await Helpers.hashPasswordfn(req.body.password);
  try{
    let user = await business.findOne({email:req.body.email, opsType:req.body.opsType});
    console.log(user);
    if(user == null) return res.send({ statusCode: 404, message: "The email address that you've entered doesn't match any account" })
    // if(user == null) return res.send({ statusCode: 404, message: "The email address that you've entered doesn't match any account" })
    bcrypt.compare(req.body.password, user.password, async function (err, match) {
      console.log("[success][business][login] : ", err, match)
      if (err)  return res.send({statusCode:500,message:"Something went wrong."});
      if (!match) return res.send({statusCode: 500,message: "The password that you've entered is incorrect."})
      return res.send({statusCode:200,message:"Login Successfully.",data:user});
    })
  }
  catch(err)
  {
    console.log('[error][business][login]: error --> ', err);
    return res.send({statusCode:500,message:"Something went wrong."});
  }
}


exports.signup=signup;
exports.login=login;