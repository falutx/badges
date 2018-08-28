var express = require('express');
var router = express.Router();

// Require the controller modules
var badgeController = require('../controllers/badgeController');

router.get('/', badgeController.index);

// BADGES ROUTES //
router.get('/badges', badgeController.badge_list);
router.get('/badges/create', badgeController.badge_create_get);
router.post('/badges/create', badgeController.badge_create_post);
router.get('/badges/:id/delete', badgeController.badge_delete_get);
router.post('/badges/:id/delete', badgeController.badge_delete_post);
router.get('/badges/:id/update', badgeController.badge_update_get);
router.post('/badges/:id/update', badgeController.badge_update_post);
router.get('/badges/:id', badgeController.badge_detail);

module.exports = router