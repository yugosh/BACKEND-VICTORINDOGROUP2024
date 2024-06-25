const express = require('express');
const router = express.Router();
const controller = require('../controllers/business_partner.controller');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.use('/create-business-partner', auth, role([0,1]), controller.createBusinessPartner);
router.use('/update-business-partner', auth, role([0,1]), controller.updateBusinessPartner);
router.use('/delete-business-partner', auth, role([1]), controller.deleteBusinessPartner);
router.use('/get-business-partner-data', auth, role([0,1]), controller.getBusinessPartnerData);
router.use('/get-business-partner-data-list', auth, role([0,1]), controller.getBusinessPartnerDataList);

module.exports = router;