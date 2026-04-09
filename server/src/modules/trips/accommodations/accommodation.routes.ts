import express from "express";
import accommodationController from "./accommodation.controller";
import { authMiddleware } from "@shared/middlewares";
import { asyncHandler } from "@shared/utils";

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.get("/", asyncHandler(accommodationController.getAccommodations.bind(accommodationController)));
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
