const AppError = require("../utils/appErrors");

exports.validate = (schemas) => {
  return (req, res, next) => {
    const validationErrors = [];

    for (const key of Object.keys(schemas)) {
      if (!req[key]) continue;

      const { error, value } = schemas[key].validate(req[key], {
        abortEarly: false,
        stripUnknown: false, // Changed to false to preserve all fields during validation
      });

      if (error) {
        error.details.forEach((d) => {
          validationErrors.push(d.message);
        });
      } else {
        req[key] = value; // sanitize
      }
    }

    if (validationErrors.length) {
      return next(new AppError(`Invalid input data: ${validationErrors.join(", ")}`, 400));
    }

    next();
  };
};
