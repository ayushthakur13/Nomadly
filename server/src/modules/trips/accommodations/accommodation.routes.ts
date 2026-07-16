import express from "express";
import accommodationController from "./accommodation.controller";
import { authMiddleware, optionalAuthMiddleware } from "@shared/middlewares";
import { asyncHandler } from "@shared/utils";

const router = express.Router({ mergeParams: true });

router.get("/", optionalAuthMiddleware, asyncHandler(accommodationController.getAccommodations.bind(accommodationController)));

router.use(authMiddleware);

router.post("/", asyncHandler(accommodationController.createAccommodation.bind(accommodationController)));

export const accommodationItemRouter = express.Router();
accommodationItemRouter.use(authMiddleware);

accommodationItemRouter.patch(
  "/:accommodationId",
  asyncHandler(accommodationController.updateAccommodation.bind(accommodationController))
);

accommodationItemRouter.delete(
  "/:accommodationId",
  asyncHandler(accommodationController.deleteAccommodation.bind(accommodationController))
);

export default router;
