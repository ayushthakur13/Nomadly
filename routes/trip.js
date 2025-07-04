const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip');

router.get('/', tripController.getTrips);
router.get('/create', tripController.getCreateTrip);
router.post('/create', tripController.postCreateTrip);
router.get('/details', tripController.getTripDetails);
router.get('/edit', tripController.getEditTrip);
router.post('/edit', tripController.postEditTrip);
router.get('/delete', tripController.getDeleteTrip);
router.post('/:tripId/tasks', tripController.postAddTask);
router.post('/:tripId/tasks/:taskId/toggle', tripController.postToggleTask);
router.post('/:tripId/tasks/:taskId/delete', tripController.postDeleteTask);
router.post('/:tripId/destinations', tripController.postAddDestination);
router.post('/:tripId/destinations/:destId/delete', tripController.postDeleteDestinantion);
router.post('/:tripId/destinations/:destId/edit', tripController.postEditDestination);

module.exports = router;
