var express = require('express');
var router = express.Router();

const settings = require('./routes/settings.routes');
router.use('/settings', settings);

const product = require('./routes/product.routes');
router.use('/product', product);

const business_partner = require('./routes/business_partner.routes');
router.use('/business_partner', business_partner);

module.exports = router;