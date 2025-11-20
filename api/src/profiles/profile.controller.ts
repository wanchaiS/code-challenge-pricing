import type { Request, Response } from "express";
import type { z } from "zod";
import type { PricingProfile } from "./models/profile.model.js";
import type { PricingProfileDetail, ProfileDetailItem } from "./profile.service.js";
import {
  createPricingProfile,
  deletePricingProfile,
  getPricingProfileDetail,
  listPricingProfiles,
  previewProfilePricing,
  updatePricingProfile,
} from "./profile.service.js";
import { createProfileSchema, updateProfileSchema } from "./schemas/profile.schema.js";

type CreateProfileInput = z.infer<typeof createProfileSchema>;
type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export async function getProfilesController(
  _req: Request,
  res: Response<PricingProfile[]>,
): Promise<void> {
  const profiles = listPricingProfiles();
  res.json(profiles);
}

export async function getProfileController(
  req: Request<{ id: string }>,
  res: Response<PricingProfileDetail>,
): Promise<void> {
  const detail = getPricingProfileDetail(req.params.id);
  res.json(detail);
}

export async function createProfileController(
  req: Request<unknown, unknown, CreateProfileInput>,
  res: Response<PricingProfile>,
): Promise<void> {
  const profile = createPricingProfile(req.body.name, req.body.selectionType);
  res.status(201).json(profile);
}

export async function updateProfileController(
  req: Request<{ id: string }, unknown, UpdateProfileInput>,
  res: Response<PricingProfile>,
): Promise<void> {
  const profile = updatePricingProfile(req.params.id, req.body);
  res.json(profile);
}

export async function deleteProfileController(
  req: Request<{ id: string }>,
  res: Response<void>,
): Promise<void> {
  deletePricingProfile(req.params.id);
  res.status(204).send();
}

export async function previewProfileController(
  req: Request<{ id: string }, unknown, UpdateProfileInput>,
  res: Response<{ items: ProfileDetailItem[] }>,
): Promise<void> {
  const items = previewProfilePricing(req.params.id, req.body);
  res.json({ items });
}
