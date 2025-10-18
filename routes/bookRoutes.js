const express = require('express');
const controller = require('../controllers/bookController');
const offerRoutes = require('./offerRoutes');
const { isSeller } = require('../middleware/auth');

const router = express.Router();

router.get('/', controller.index);

router.get('/new', controller.new);

router.post('/', controller.create);

router.get('/:id', controller.item);

router.get('/:id/edit', isSeller, controller.edit);

router.put('/:id', isSeller, controller.update);

router.delete('/:id', isSeller, controller.delete);

router.use('/:id/offers', offerRoutes);

module.exports = router;
