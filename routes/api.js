var express = require('express');
var router = express.Router();

var apiController = require('../controllers/apiController');

router.get('/users', apiController.user_list);
router.get('/users/:id', apiController.user_get);
router.post('/users/create', apiController.user_create);
router.post('/users/:id/delete', apiController.user_delete);
router.post('/users/:id/update', apiController.user_update);

router.get('/badgeInstances/byUserEmail/:email', apiController.badgeInstances_byUserEmail)
module.exports = router;
