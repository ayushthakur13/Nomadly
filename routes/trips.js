const express = require('express');
const router = express.Router();

const tripController = require('../controllers/trip/trips');
const tripTaskController = require('../controllers/trip/tasks');
const tripDestinationController = require('../controllers/trip/destinations');
const tripBudgetController = require('../controllers/trip/budget');

router.get('/', tripController.getTrips);
router.get('/create', tripController.getCreateTrip);
router.post('/create', tripController.postCreateTrip);
router.get('/details', tripController.getTripDetails);
router.get('/edit', tripController.getEditTrip);
router.post('/edit', tripController.postEditTrip);
router.get('/delete', tripController.getDeleteTrip);

router.post('/:tripId/tasks', tripTaskController.postAddTask);
router.post('/:tripId/tasks/:taskId/toggle', tripTaskController.postToggleTask);
router.post('/:tripId/tasks/:taskId/delete', tripTaskController.postDeleteTask);

router.post('/:tripId/destinations', tripDestinationController.postAddDestination);
router.post('/:tripId/destinations/:destId/delete', tripDestinationController.postDeleteDestinantion);
router.post('/:tripId/destinations/:destId/edit', tripDestinationController.postEditDestination);

router.post('/:tripId/budget/update', tripBudgetController.postAddBudget);
router.post('/:tripId/expenses', tripBudgetController.postAddExpense);
router.post('/:tripId/expenses/:expenseId/delete', tripBudgetController.postDeleteExpense);

module.exports = router;
