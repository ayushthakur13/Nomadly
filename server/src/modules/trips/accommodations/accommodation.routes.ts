import express from "express";
import accommodationController from "./accommodation.controller";
import { authMiddleware, optionalAuthMiddleware, validate } from "@shared/middlewares";
import { asyncHandler } from "@shared/utils";
import { createAccommodationSchema, updateAccommodationSchema } from "./accommodation.schema";

const router = express.Router({ mergeParams: true });

router.get("/", optionalAuthMiddleware, asyncHandler(accommodationController.getAccommodations.bind(accommodationController)));

router.use(authMiddleware);

router.post("/", validate(createAccommodationSchema), asyncHandler(accommodationController.createAccommodation.bind(accommodationController)));

export const accommodationItemRouter = express.Router();
accommodationItemRouter.use(authMiddleware);

accommodationItemRouter.patch(
  "/:accommodationId",
  validate(updateAccommodationSchema),
  asyncHandler(accommodationController.updateAccommodation.bind(accommodationController))
);

accommodationItemRouter.delete(
  "/:accommodationId",
  asyncHandler(accommodationController.deleteAccommodation.bind(accommodationController))
);

export default router;
