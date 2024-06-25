const express = require('express');
const router = express.Router();
const controller = require('../controllers/product.controller');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.use('/create-products', auth, role([0,1]), controller.createProducts);
router.use('/update-products', auth, role([0,1]), controller.updateProducts);
router.use('/delete-products', auth, role([1]), controller.deleteProduct);
router.use('/get-products-data', auth, role([0,1]), controller.getProductsData);
router.use('/get-products-data-list', auth, role([0,1]), controller.getProductsDataList);

module.exports = router;