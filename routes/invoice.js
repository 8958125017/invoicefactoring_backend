const express = require('express');
const invoice = require('../controllers/invoices.js');
const router = express.Router();
router.post('/createInvoiceBySeller', invoice.createInvoiceBySeller);
router.post('/uploadFile', invoice.uploadFile);
router.post('/buyerResponseInvoice', invoice.buyerResponseInvoice);
router.post('/sellerLenderSubmit', invoice.sellerLenderSubmit);
router.post('/LenderSubmit', invoice.LenderSubmit);
router.post('/getIssuedinvoice', invoice.getIssuedinvoice);
router.post('/getAllReceivedInvoices', invoice.getAllReceivedInvoices);
router.post('/getAllLenderInvoices', invoice.getAllLenderInvoices);
router.post('/getAllRaisedInvoices', invoice.getAllRaisedInvoices);
router.post('/getProcessedInvoiceCount', invoice.getProcessedInvoiceCount);
router.post('/getApprovedInvoiceCount', invoice.getApprovedInvoiceCount);
router.post('/getTotalInvoiceRaisedCount',invoice.getTotalInvoiceRaisedCount);
router.post('/getTotalProcessedInvoiceCount',invoice.getTotalProcessedInvoiceCount);
router.post('/getTotalProcessInvoiceCount',invoice.getTotalProcessInvoiceCount);
module.exports = router
