const Joi = require('joi');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });
    if (error) {
      const details = error.details.map(d => d.message);
      return res.status(400).json({ error: 'Validation Error', details });
    }
    req[property] = value;
    next();
  };
};

const schemas = {
  createProject: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().max(500).allow(''),
    industry: Joi.string().valid('erp', 'logistics', 'supply_chain', 'custom').required()
  }),

  updateProject: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    description: Joi.string().max(500).allow(''),
    status: Joi.string().valid('questionnaire', 'designing', 'generating', 'generated', 'deploying', 'deployed', 'failed')
  }),

  saveQuestionnaireStep: Joi.object({
    responses: Joi.object().required()
  }),

  updateModules: Joi.object({
    modules: Joi.array().items(Joi.object({
      moduleId: Joi.string().required(),
      name: Joi.string().required(),
      displayName: Joi.string(),
      position: Joi.object({ x: Joi.number(), y: Joi.number() }),
      entities: Joi.array(),
      apis: Joi.array(),
      workflows: Joi.array()
    })),
    relationships: Joi.array()
  }),

  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(100).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  createOrder: Joi.object({
    planId: Joi.string().valid('pro', 'enterprise').required(),
    currency: Joi.string().valid('INR', 'USD').default('INR')
  }),

  verifyPayment: Joi.object({
    razorpay_order_id: Joi.string().required(),
    razorpay_payment_id: Joi.string().required(),
    razorpay_signature: Joi.string().required(),
    planId: Joi.string().valid('pro', 'enterprise').required()
  })
};

module.exports = { validate, schemas };
