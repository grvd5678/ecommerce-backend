import Joi from 'joi';

export const validate = (schema) => {
  return (req, res, next) => {
    // Check if it's Zod (has safeParse)
    if (schema.safeParse) {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        // Extract error messages from Zod issues
        const message = result.error.issues.map(err => err.message).join(', ');
        return res.status(400).json({ message });
      }
      next();
    } 
    // Check if it's Joi (has validate)
    else if (schema.validate) {
      const { error } = schema.validate(req.body, { abortEarly: false });
      if (error) {
        const message = error.details.map((detail) => detail.message).join(', ');
        return res.status(400).json({ message });
      }
      next();
    } 
    else {
      next();
    }
  };
};
