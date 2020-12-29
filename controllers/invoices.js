const async = require('async');
const bcrypt = require('bcrypt-nodejs');
const config = require('../helpers/config')
const Helpers = require('../helpers/helper')
const business = require('../models/business');
const invoice = require('../models/invoice');
const multichain = require('../helpers/multichain')
const multichainCredential = config.credentials;

async function createInvoiceBySeller(req,res){
  console.log("req.body = = ",req.body);
  let keys = []
   // if (!req.body.opsType) return res.send({statusCode:400,message:"Opstype type not provide"})
   if (!req.body.pubBlockaddr) return res.send({statusCode:400,message:"publisher address not provided"})
   if (!req.body.issuingCompanyEmail) return res.send({statusCode:400,message:"business EmailId not provided"})
   if (!req.body.purchasingCompanyEmail) return res.send({statusCode:400,message:"buyer EmailId not provided"})
    let invoices = req.body.invoice
   if (invoices.length<1) return res.send({statusCode:400,message:"invoice not provided"})
   if (!req.body.totalInvoiceAmount) return res.send({statusCode:400,message:"Total Amount not provided"})
  
   let raise_invocie =[]
  let invoiceDLTID = 'ID'+Math.floor(Math.random() * (9999999999 - 1000000000)) + 10000
  keys.push(invoiceDLTID)
  async.each(invoices,async(element,ri)=>{
   if(!element.invoiceNo && !element.invoiceDate && !element.invoiceAmount && !element.invoiceDoc){
     return res.send({statusCode:400,message:"invoice number not provided"});
   }
   raise_invocie.push({ invoiceNo:element.invoiceNo, invoiceDate: element.invoiceDate, invoiceAmount:element. invoiceAmount })
   keys.push(element.invoiceNo)
     // console.log("req.body = = 12345");
  })

   let publishData={
     invoice:req.body.invoice,
     issuingCompanyEmail:req.body.issuingCompanyEmail,
     purchasingCompanyEmail:req.body.purchasingCompanyEmail,
     lenderEmail:req.body.lenderEmail,
     totalInvoiceAmount:req.body.totalInvoiceAmount,
     pubBlockaddr:req.body.pubBlockaddr, 
     id: invoiceDLTID,
     sts: '1'
   }
  let mdata = await invoice.create(publishData, async (err,result)=>{
    if(err) return res.send({statusCode:400,message:"error in inserting doc", data : err})

     let publish = await multichainCredential.publishFrom({
      from: req.body.pubBlockaddr,
      stream:"invoice",
      key: keys,
      data: {"json":publishData}
    }, (err, result)=>{
      console.log(keys)
      if(err) res.send({statusCode:400,message:"Error occured while publishing land", data:err})
      else{
        console.log("Invoice raised success", JSON.stringify(result))
        return res.send({statusCode:200,message:"Invoice raised Successfully", data: result})
      }
    })

  });
}

async function uploadFile (req, res) {
    console.log("===============UPLOAD FILE==================", req.files);
    if (!(req.files && req.files.doc))
      return  res.send({statusCode:400,message:"Error occured while uploading file land"})
    extension = req.files.doc.name.split(".");
    FileName = Date.now() + '_' + req.files.doc.name;
    docpath = "./files/invoices/" + FileName;
    req.files.doc.mv(docpath, err => {
      console.log("err = = ="+err)
      if (err) {
        console.log("Permission denied!Unable to upload file.")
        return res.send({statusCode: 500, message:'Error coocured while uploading file'});
      }
      else {
        // fs.unlink(docpath, (error) => {
        //  if (error) {
        //    console.error(error)
        //    return res.send(Message.Error500());
        //  }
          console.log(" success", config.nodeIp + FileName);
          return res.send({statusCode: 200 , message: 'DOWNLOAD LINK', data: config.nodeIp + FileName});
        // });
      }
    });
}

async function buyerResponseInvoice (req,res){
  if (!req.body.email) return res.send({statusCode:400,message:"Email Id is missing."});
  if (!req.body.opsType) return res.send({statusCode:400,message:"Opstype is missing."});
  if (!req.body.pubBlockaddr) return res.send({statusCode:400,message:"publisher address not provided"})
  if (!req.body.invoiceID) return res.send({statusCode:400,message:"Invoice ID not provided"})

  if (!req.body.sts){
   console.log("request = = = "+request);
    await invoice.findOneAndUpdate({id: req.body.invoiceID, purchasingCompanyEmail: req.body.email}, {sts: 0, buts: Date.now()}, async function(err, data){
      console.log("request = = = "+data);
      if (err) return res.send({statusCode:500,message:"Error occured while processing request"})
      if (data){


        await multichain.listStreamsKeyItem({stream:"invoice",key:data.id}, async (result)=>{
          if(!result) {
            console.log("result else",result)
            res.send({statusCode:400,message:'Invalid invoice request'})
          }
            // res.send({'responseCode':500,'responseMessage':'Something went wrong',error:err})
          else{
            let publishData = {
              buts: Date.now(),
              sts: "rejected"
            }

            let publish = await multichainCredential.publishFrom({
              from:req.body.pubBlockaddr,
              stream:"invoice",
              key:result.keys,
              data: {"json":publishData}
            }, (err, result)=>{
              // if(err) res.send({statusCode:400,message:"Error occured while publishing owner", data:err})
              if(err) return res.send({statusCode:500,message:"Error occured while processing request"})
              else{
                return res.send({statusCode:200,message:"Invoice requested success", data : data})
              }
            })

              console.log("\nresult",JSON.stringify(result))

          }
        })
        
      }
      else{
        res.send({statusCode:400,message:'Invalid invoice request'})
      }
    })

  }
  else{
    if (!req.body.nodalReceipt) return res.send({statusCode:400,message:"Receipt is missing."});

    // let nodalReceipt = "./files/nodalReceipt/"+req.files.nodalReceipt.name
    // req.files.nodalReceipt.mv(nodalReceipt)
    let publishData = {}

    await invoice.findOneAndUpdate({id: req.body.invoiceID, purchasingCompanyEmail: req.body.email}, {sts: 2, buts: Date.now(), nodalReceipt : req.body.nodalReceipt}, async function(err, data){
      if (err) return res.send({statusCode:500,message:"Error occured while processing request"})
      if (data){
        multichain.listStreamsKeyItemBlock({stream:"invoice",key:req.body.invoiceID}, async (result)=>{
          if(!result) {
            console.log("result else",result)
            res.send({statusCode:400,message:'Invalid invoice request'})
          }
            // res.send({'responseCode':500,'responseMessage':'Something went wrong',error:err})
          else{
            let publishData = {
              buts: Date.now(),
              sts: "accepted by buyer",

            }

            let publish = await multichainCredential.publishFrom({
              from:req.body.pubBlockaddr,
              stream:"invoice",
              key:result.keys,
              data: {"json":publishData}
            }, (err, results)=>{
              // if(err) res.send({statusCode:400,message:"Error occured while publishing owner", data:err})
              if(err) return res.send({statusCode:500,message:"Error occured while processing request", err: err})
              else{
                return res.send({statusCode:200,message:"Invoice rejected success", data : data})
              }
            })

              console.log("\nresult",JSON.stringify(result))

          }
        })
      }
    })
  }
}

async function sellerLenderSubmit (req,res){
  if (!req.body.email) return res.send({statusCode:400,message:"Email Id is missing."});
  if (!req.body.opsType) return res.send({statusCode:400,message:"Opstype is missing."});
  if (!req.body.pubBlockaddr) return res.send({statusCode:400,message:"publisher address not provided"})
  if (!req.body.invoiceID) return res.send({statusCode:400,message:"Invoice ID not provided"})
  if (!req.body.lenderEmail) return res.send({statusCode:400,message:"lender Email ID not provided"})

  invoice.findOneAndUpdate({id: req.body.invoiceID, issuingCompanyEmail: req.body.email},{sts:3,lenderEmail:req.body.lenderEmail }, async function(err, data){
      if (err) return res.send({statusCode:500,message:"Error occured while processing request"})
      if (data){
        multichain.listStreamsKeyItemBlock({stream:"invoice",key:req.body.invoiceID}, async (result)=>{
          if(!result) {
            console.log("result else",result)
            res.send({statusCode:400,message:'Invalid invoice request'})
          }
            // res.send({'responseCode':500,'responseMessage':'Something went wrong',error:err})
          else{
            let publishData = {
              suts: Date.now(),
              sts: "send to lender"
            }

            let publish = await multichainCredential.publishFrom({
              from:req.body.pubBlockaddr,
              stream:"invoice",
              key:result.keys,
              data: {"json":publishData}
            }, (err, result)=>{
              // if(err) res.send({statusCode:400,message:"Error occured while publishing owner", data:err})
              if(err) return res.send({statusCode:500,message:"Error occured while processing request"})
              else{
                return res.send({statusCode:200,message:"Invoice submitted to lender", data : data})
              }
            })

              console.log("\nresult",JSON.stringify(result))

          }
        })


      }
      else{
        res.send({statusCode:400,message:'Invalid invoice request'})
      }
    })
}

async function LenderSubmit (req,res){
  if (!req.body.email) return res.send({statusCode:400,message:"Email Id is missing."});
  if (!req.body.opsType) return res.send({statusCode:400,message:"Opstype is missing."});
  if (!req.body.pubBlockaddr) return res.send({statusCode:400,message:"publisher address not provided"})
  if (!req.body.invoiceID) return res.send({statusCode:400,message:"Invoice ID not provided"})


  if (!req.body.sts){
    invoice.findOneAndUpdate({id: req.body.invoiceID, lenderEmail: req.body.email},
    { 
      luts: Date.now(),
      sts: 4
    }, async function(err, data){
      if (err) return res.send({statusCode:500,message:"Error occured while processing request"})
      if (data){
        multichain.listStreamsKeyItemBlock({stream:"invoice",key:req.body.invoiceID}, async (result)=>{
          if(!result) {
            console.log("result else",result)
            res.send({statusCode:400,message:'Invalid invoice request'})
          }
            // res.send({'responseCode':500,'responseMessage':'Something went wrong',error:err})
          else{
            let publishData = { 
              luts: Date.now(),
              sts: "rejected by lender"
            }

            let publish = await multichainCredential.publishFrom({
              from:req.body.pubBlockaddr,
              stream:"invoice",
              key:result.keys,
              data: {"json":publishData}
            }, (err, results)=>{
              // if(err) res.send({statusCode:400,message:"Error occured while publishing owner", data:err})
              if(err) return res.send({statusCode:500,message:"Error occured while processing request"})
              else{
                return res.send({statusCode:200,message:"Invoice rejected success", data : data})
              }
            })

              console.log("\nresult",JSON.stringify(result))

          }
        })


      }
      else{
        res.send({statusCode:400,message:'Invalid invoice request'})
      }
    })
  }
  else{
    if (!req.body.lendingAmount) return res.send({statusCode:400,message:"lending Amount not provided"})
    if (!req.body.lendingInterest) return res.send({statusCode:400,message:"lending Interest not provided"})
    if (!req.body.dateOfPayment) return res.send({statusCode:400,message:"date Of Payment not provided"})
    invoice.findOneAndUpdate({id: req.body.invoiceID, lenderEmail: req.body.email},
    { 
      lendingAmount: req.body.lendingAmount,
      lendingInterest: req.body.lendingInterest,
      dateOfPayment: req.body.dateOfPayment,
      luts: Date.now(),
      sts: 5
    }, async function(err, data){
      if (err) return res.send({statusCode:500,message:"Error occured while processing request"})
      if (data){
        multichain.listStreamsKeyItemBlock({stream:"invoice",key:req.body.invoiceID}, async (result)=>{
          if(!result) {
            console.log("result else",result)
            res.send({statusCode:400,message:'Invalid invoice request'})
          }
            // res.send({'responseCode':500,'responseMessage':'Something went wrong',error:err})
          else{
            let publishData = { 
              lendingAmount: req.body.lendingAmount,
              lendingInterest: req.body.lendingInterest,
              dateOfPayment: req.body.dateOfPayment,
              luts: Date.now(),
              sts: "accepted and processed"
            }

            let publish = await multichainCredential.publishFrom({
              from:req.body.pubBlockaddr,
              stream:"invoice",
              key:result.keys,
              data: {"json":publishData}
            }, (err, results)=>{
              // if(err) res.send({statusCode:400,message:"Error occured while publishing owner", data:err})
              if(err) return res.send({statusCode:500,message:"Error occured while processing request"})
              else{
                return res.send({statusCode:200,message:"Invoice processed success", data : data})
              }
            })

              console.log("\nresult",JSON.stringify(result))

          }
        })


      }
      else{
        res.send({statusCode:400,message:'Invalid invoice request'})
      }
    })
  }
}

//-------------------------------------------


async function getIssuedinvoice (req,res){
	  if (!req.body.invoiceID) return res.send({statusCode:400,message:"invoiceID not provide"})

	  invoice.find({id:req.body.invoiceID}, (err, result)=>{
	    if (err) return res.send({statusCode:400,message:"Error occured while fetching invoice", data:err})
	    if (result){
	      return res.send({statusCode:200,message:"invoice records found", data:result, count:result.length})
	    }
	    else{
	      return res.send({statusCode:200,message:"No data found", data:result})
	    }
	  })
}

async function getAllRaisedInvoices (req,res){
  console.log("req = = = "+req);
	if (!req.body.email) return res.send({statusCode:400,message:"pubBlockaddr not provide"})
  if (!req.body.opsType) return res.send({statusCode:400,message:"opstype not provide"})
  if(req.body.sts == null){
    invoice.find({issuingCompanyEmail:req.body.email}, (err, result)=>{
      if (err) return res.send({statusCode:400,message:"Error occured while fetching invoice", data:err})
      if (result){
        return res.send({statusCode:200,message:"invoice records found", data:result, count:result.length})
      }
      else{
        return res.send({statusCode:200,message:"No data found", data:result})
      }
    })
  }
  else{
    invoice.find({issuingCompanyEmail:req.body.email, sts: req.body.sts}, (err, result)=>{
      if (err) return res.send({statusCode:400,message:"Error occured while fetching invoice", data:err})
      if (result){
        return res.send({statusCode:200,message:"invoice records found", data:result, count:result.length})
      }
      else{
        return res.send({statusCode:200,message:"No data found", data:result})
      }
    })
  }
  
}

async function  getAllReceivedInvoices(req,res){
  console.log("seller = = = "+req);
  if (!req.body.email) return res.send({statusCode:400,message:"pubBlockaddr not provide"})
  if (!req.body.opsType) return res.send({statusCode:400,message:"opstype not provide"})
  if (req.body.sts){
    invoice.find({purchasingCompanyEmail:req.body.email, sts: req.body.sts}, (err, result)=>{
      if (err) return res.send({statusCode:400,message:"Error occured while fetching invoice", data:err})
      if (result){
        return res.send({statusCode:200,message:"invoice records found", data:result, count:result.length})
      }
      else{
        return res.send({statusCode:200,message:"No data found", data:result})
      }
    })
  }
  else{
    invoice.find({purchasingCompanyEmail:req.body.email,sts:{ $in: [1,2]}}, (err, result)=>{
      if (err) return res.send({statusCode:400,message:"Error occured while fetching invoice", data:err})
      if (result){
        return res.send({statusCode:200,message:"invoice records found", data:result, count:result.length})
      }
      else{
        return res.send({statusCode:200,message:"No data found", data:result})
      }
    })
  }
}


async function getAllLenderInvoices (req,res){
  if (!req.body.email) return res.send({statusCode:400,message:"pubBlockaddr not provide"})
  if (!req.body.opsType) return res.send({statusCode:400,message:"opstype not provide"})
    console.log("req.body.sts = = "+req.body.sts);
  if (req.body.sts){
    invoice.find({lenderEmail:req.body.email, sts: req.body.sts}, (err, result)=>{
      if (err) return res.send({statusCode:400,message:"Error occured while fetching invoice", data:err})
      if (result){
        return res.send({statusCode:200,message:"invoice records found", data:result, count:result.length})
      }
      else{
        return res.send({statusCode:200,message:"No data found", data:result})
      }
    })
  }
  else{
    console.log("req.body.sts = = "+req.body.sts);
    invoice.find({lenderEmail:req.body.email,sts:{ $in: [2,5]}}, (err, result)=>{
      if (err) return res.send({statusCode:400,message:"Error occured while fetching invoice", data:err})
      if (result){
        return res.send({statusCode:200,message:"invoice records found", data:result, count:result.length})
      }
      else{
        return res.send({statusCode:200,message:"No data found", data:result})
      }
    })
  }
}

async function getProcessedInvoiceCount(req,res){
 invoice.find({sts:req.body.sts}, function( err, result){
    if (err) return res.send({statusCode:400,message:"Error occured while fetching count", data:err})
     if (result){
      return res.send({statusCode:200,message:"processed invoice count", data:result.length})
    }
    console.log( "Number of Business:", count );
  })
}

async function getApprovedInvoiceCount(req,res){
 invoice.find({sts:req.body.sts}, function( err, result){
    if (err) return res.send({statusCode:400,message:"Error occured while fetching count", data:err})
     if (result){
      return res.send({statusCode:200,message:"Approve invoice count", data:result.length})
    }
    console.log( "Number of Business:", count );
  })
}

async function getTotalInvoiceRaisedCount(req,res){
   invoice.find({pubBlockaddr:req.body.pubBlockaddr,issuingCompanyEmail:req.body.email,sts:req.body.sts},function(err,result){
    if(err){
      return res.send({statusCode:400,message:"Error occured while fetching count", data:err})
    }
    else{
      return res.send({statusCode:200,message:"Total raised invoice count", data:result.length})
    }
  })
}

async function getTotalProcessedInvoiceCount(req,res){
  invoice.find({pubBlockaddr:req.body.pubBlockaddr,issuingCompanyEmail:req.body.email,sts:req.body.sts},function(err,result){
    if(err){
      return res.send({statusCode:400,message:"Error occured while fetching count", data:err})
    }
    else{
      return res.send({statusCode:200,message:"Total processed invoice count", data:result.length})
    }
  })
}
async function getTotalProcessInvoiceCount(req,res){
  invoice.find({pubBlockaddr:req.body.pubBlockaddr,issuingCompanyEmail:req.body.email,sts:req.body.sts},function(err,result){
    if(err){
      return res.send({statusCode:400,message:"Error occured while fetching count", data:err})
    }
    else{
      return res.send({statusCode:200,message:"Total process invoice count", data:result.length})
    }
  })
}

exports.uploadFile=uploadFile;
exports.createInvoiceBySeller=createInvoiceBySeller;
exports.buyerResponseInvoice=buyerResponseInvoice;
exports.sellerLenderSubmit=sellerLenderSubmit;
exports.LenderSubmit=LenderSubmit;
exports.getIssuedinvoice=getIssuedinvoice;
exports.getAllRaisedInvoices=getAllRaisedInvoices;
exports.getAllReceivedInvoices=getAllReceivedInvoices;
exports.getAllLenderInvoices=getAllLenderInvoices;
exports.getProcessedInvoiceCount=getProcessedInvoiceCount;
exports.getApprovedInvoiceCount=getApprovedInvoiceCount;
exports.getTotalInvoiceRaisedCount=getTotalInvoiceRaisedCount;
exports.getTotalProcessedInvoiceCount=getTotalProcessedInvoiceCount;
exports.getTotalProcessInvoiceCount=getTotalProcessInvoiceCount;