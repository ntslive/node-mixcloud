var Joi = require('joi');

exports.date = Joi.alternatives().try(
  Joi.date(),
  Joi.number(),
  Joi.string().isoDate()
);

exports.pagination = Joi.object()
  .optional()
  .default({})
  .keys({
    limit: Joi.number().min(1).max(100).integer().optional(),
    since: exports.date.optional(),
    until: exports.date.optional()
  })
  // Hack around Joi not having `nand` (that is `since` and `until` are
  // optional, but if one is supplied then the other can't be)
  .without('since', 'until')
  .without('until', 'since');
