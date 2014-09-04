var Joi = require('joi');

// Date format used by Mixcloud
exports.dateFormatString = "YYYY-MM-DD HH:mm:ss";
exports.dateFormatRegex = /^\d{4}-\d{2}-\d{2}( |\+|\%20)\d{2}(\:|\%3A)\d{2}(\:|\%3A)\d{2}$/i;
// Parse the date format used by Mixcloud, also handles URL Encoded Strings (ugh):
exports.dateFormat = Joi.string().regex(exports.dateFormatRegex);

exports.date = Joi.alternatives().try(
  Joi.date(),
  Joi.number(),
  exports.dateFormat,
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

exports.path = Joi.string().regex(/^(\/?)(([^?\/]+)\/?)*$/).min(1);

exports.key = Joi.string().regex(/^\/[\w-]+\/[\w-]+\/$/);

exports.slug = Joi.string().regex(/^[\w-]+$/);

exports.username = exports.slug;
