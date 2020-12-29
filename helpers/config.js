const mongoUrl = 'mongodb://penny:boostersA123@49.50.67.44:27017/invoicefactoring?authSource=admin'; 	// Mongo DB URL for Node maintained data
const host='http://49.50.67.44';				// URL for Angular code (Entity) [RedirectURL]
const port='2029';								// Port on which Node instance is running
const credentials = require("multichain-node")({
  port: '9251',
  host: '49.50.67.44',
  user: "multichainrpc",
  pass: "3a6ykGHVUd8vTMKH1SXniHA4asMhKgkHP1oAp6o9Ljg4"
});

const adminAddress = '1VVoqN4SnfyGRuk1NhbxypVgpzDj2rXrfXec5X';
const emailAddress = "qtlmailer@gmail.com"
const emailPassword="boostersA123"
const nodeIp = 'http://49.50.67.44/invoice-backend/files/'
module.exports = {
	mongoUrl: mongoUrl,
	host: host,
	port: port,
	credentials:credentials,
	adminAddress:adminAddress,
	emailAddress:emailAddress,
	emailPassword:emailPassword,
	nodeIp:nodeIp
}
