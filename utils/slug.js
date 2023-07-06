const slugify = require("slugify");

exports.toLowerCaseSlug = (value) => slugify(value, { lower: true });
