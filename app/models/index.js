const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.user_account = require("./user_account.model.js")(mongoose);
db.document_count = require("./document_count.model.js")(mongoose);
db.document_log = require("./document_log.model.js")(mongoose);
db.product = require("./product.model.js")(mongoose);
db.business_partner = require("./business_partner.model.js")(mongoose);

module.exports = db;