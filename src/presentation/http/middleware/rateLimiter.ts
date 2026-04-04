import rateLimit from "express-rate-limit";
import { ApiResponseBuilder } from "../../../shared/api-response";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res
      .status(429)
      .json(
        ApiResponseBuilder.error("Too many requests, please try again later"),
      );
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res
      .status(429)
      .json(
        ApiResponseBuilder.error(
          "Too many login attempts, please try again later",
        ),
      );
  },
});

export const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res
      .status(429)
      .json(ApiResponseBuilder.error("Too many verification requests"));
  },
});
