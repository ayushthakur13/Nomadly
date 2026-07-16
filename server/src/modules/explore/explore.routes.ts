import { Router } from "express";
import exploreController from "./explore.controller";
import { authMiddleware, optionalAuthMiddleware } from "@shared/middlewares";

const router = Router();

// Publicly viewable routes
router.get("/trips", optionalAuthMiddleware, exploreController.getExploreFeed);
router.get("/trips/:tripId/status", optionalAuthMiddleware, exploreController.getTripSocialStatus);

// Auth required routes
router.use(authMiddleware);

router.post("/trips/:tripId/like", exploreController.likeTrip);
router.delete("/trips/:tripId/like", exploreController.unlikeTrip);

router.post("/trips/:tripId/save", exploreController.saveTrip);
router.delete("/trips/:tripId/save", exploreController.unsaveTrip);

router.get("/saved", exploreController.getSavedTrips);

export default router;
