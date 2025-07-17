const express = require('express');
const router = express.Router();
const { uploadTripCover, uploadMemory } = require('../middlewares/multer');

const tripController = require('../controllers/trip/trips');
const tripTaskController = require('../controllers/trip/tasks');
const tripDestinationController = require('../controllers/trip/destinations');
const tripBudgetController = require('../controllers/trip/budget');
const tripAccommodationController = require('../controllers/trip/accommodations');
const tripMemberController = require('../controllers/trip/members');
const tripChatController = require('../controllers/trip/chat');
const tripMemoriesController = require('../controllers/trip/memories');
const tripPublishController = require('../controllers/trip/publish');
const tripCloneController = require('../controllers/trip/clone');

router.get('/', tripController.getTrips);
router.get('/create', tripController.getCreateTrip);
router.post('/create', tripController.postCreateTrip);
router.get('/:tripId/details', tripController.getTripDetails);
router.get('/:tripId/edit', tripController.getEditTrip);
router.post('/edit', tripController.postEditTrip);
router.get('/:tripId/delete', tripController.getDeleteTrip);

router.post('/:tripId/tasks', tripTaskController.postAddTask);
router.post('/:tripId/tasks/:taskId/toggle', tripTaskController.postToggleTask);
router.post('/:tripId/tasks/:taskId/delete', tripTaskController.postDeleteTask);

router.post('/:tripId/destinations', tripDestinationController.postAddDestination);
router.post('/:tripId/destinations/:destId/delete', tripDestinationController.postDeleteDestinantion);
router.post('/:tripId/destinations/:destId/edit', tripDestinationController.postEditDestination);

router.post('/:tripId/budget/update', tripBudgetController.postAddBudget);
router.post('/:tripId/budget/reset', tripBudgetController.postResetBudget);
router.post('/:tripId/expenses', tripBudgetController.postAddExpense);
router.post('/:tripId/expenses/:expenseId/delete', tripBudgetController.postDeleteExpense);

router.post('/:tripId/accommodations', tripAccommodationController.postAddAccommodation);
router.post('/:tripId/accommodations/:accommoId/delete', tripAccommodationController.postDeleteAccommodation);
router.post('/:tripId/accommodations/:accommoId/edit', tripAccommodationController.postEditAccommodation);

router.post('/:tripId/members/invite', tripMemberController.postInviteMember);
router.post('/:tripId/members/:memberId/remove', tripMemberController.postRemoveMember);
// router.post('/:tripId/members/:memberId/make-owner', tripMemberController.postMakeOwner);
router.post('/:tripId/leave', tripMemberController.postLeaveTrip);

router.get('/:tripId/chat', tripChatController.getTripChat);

router.post('/:tripId/cover/update', uploadTripCover.single('image'), tripMemoriesController.postUpdateTripCoverImage);
router.post('/:tripId/cover/delete', tripMemoriesController.postDeleteTripCoverImage);
router.post('/:tripId/memories/add', uploadMemory.single('image'), tripMemoriesController.postAddMemory);
router.post('/:tripId/memories/delete', tripMemoriesController.postDeleteMemory);

router.post('/:tripId/publish/', tripPublishController.postPublishTrip);
router.post('/:tripId/unpublish', tripPublishController.postUnpublishTrip);

router.post('/:tripId/clone', tripCloneController.postCloneTrip);

module.exports = router;
