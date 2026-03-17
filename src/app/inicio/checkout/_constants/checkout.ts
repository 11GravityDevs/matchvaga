import type { Appearance } from "@stripe/stripe-js";

export const CHECKOUT_PIX_JUST_PAID_KEY = "matchvaga_checkout_pix_just_paid";

export const CHECKOUT_STRIPE_APPEARANCE: Appearance = {
  theme: "stripe",
  inputs: "spaced",
  labels: "above",
};
