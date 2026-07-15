import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

const productKnowledge = {
  headphones: "Our Wireless Headphones offer noise cancellation and 20h battery life. They are priced at ₹2999.",
  shoes: "We have comfortable running shoes for ₹599 and Nike trainers for daily wear.",
  default: "I'm your ShopHub assistant. You can ask me about our products, pricing, or shipping!",
};

export const chat = asyncHandler(async (req, res, next) => {
  const { message } = req.body;
  if (!message) return next(new AppError('Message is required', 400));

  const lowerMsg = message.toLowerCase();
  let response = productKnowledge.default;

  if (lowerMsg.includes('headphone')) response = productKnowledge.headphones;
  else if (lowerMsg.includes('shoe')) response = productKnowledge.shoes;

  res.json({ response });
});
