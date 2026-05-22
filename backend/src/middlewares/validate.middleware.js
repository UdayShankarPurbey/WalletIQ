const validate = (schemas) => (req, _res, next) => {
  const validated = {};
  for (const key of ['body', 'params', 'query']) {
    const schema = schemas?.[key];
    if (!schema) continue;
    const result = schema.safeParse(req[key]);
    if (!result.success) return next(result.error);
    validated[key] = result.data;
  }
  req.validated = validated;
  next();
};

export { validate };
