const express = require('express');
const router = express.Router();
const controller = require('../controllers/settings.controller');
// const auth = require('../middlewares/auth');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.use('/create-user', auth, role([1]), controller.createUser);
router.use('/update-user', auth, role([1]), controller.updateUser);
router.use('/delete-user', auth, role([0, 1]), controller.deleteUser);
router.use('/get-user-data', auth, role([0, 1]), controller.getUserData);
router.use('/get-user-data-list', auth, role([0, 1]), controller.getUserDataList);


router.use('/get-document-log', auth, role([0, 1]), controller.getDocumentLogs);
router.use('/get-document-log-list', auth, role([0, 1]), controller.getDocumentLogsList);


router.use('/get-document-count', auth, role([0, 1]), controller.getDocumentCount);

module.exports = router;