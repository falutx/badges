var express = require('express');
var router = express.Router();

// Require the user controller
var userController = require('../controllers/userController');
var badgeInstanceController = require('../controllers/badgeInstanceController');

/* GET users listing. */
router.get('/', userController.user_list);
router.get('/create', userController.user_create_get);
router.post('/create', userController.user_create_post);
router.get('/:id/delete', userController.user_delete_get);
router.post('/:id/delete', userController.user_delete_post);
router.get('/:id/update', userController.user_update_get);
router.post('/:id/update', userController.user_update_post);
router.get('/:id', userController.user_detail);

// BADGE INSTANCE ROUTES //
router.get('/:userId/badges/create', badgeInstanceController.badgeInstance_create_get);
router.post('/:userId/badges/create', badgeInstanceController.badgeInstance_create_post);
router.get('/:userId/badges/:id/delete', badgeInstanceController.badgeInstance_delete_get);
router.post('/:userId/badges/:id/delete', badgeInstanceController.badgeInstance_delete_post);
router.get('/:userId/badges/:id/update', badgeInstanceController.badgeInstance_update_get);
router.post('/:userId/badges/:id/update', badgeInstanceController.badgeInstance_update_post);
router.get('/:userId/badges/:id', badgeInstanceController.badgeInstance_detail);
router.get('/:userId/badges', badgeInstanceController.badgeInstance_list);


module.exports = router;
