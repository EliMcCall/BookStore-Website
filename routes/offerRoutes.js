const express = require('express');
const controller = require('../controllers/offerController');
const router = express.Router({ mergeParams: true });

router.post('/', controller.create);

router.get('/', controller.viewOffers);

router.put('/:offerId/accept', controller.acceptOffer);

module.exports = router;
