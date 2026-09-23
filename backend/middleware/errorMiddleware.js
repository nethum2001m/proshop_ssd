const notFound = (req, res, next) => {
  const error = new Error(
    `The url you requested - ${req.originalUrl} - does not exist.`
  );
  res.status(404);
  next(error);
};

const errorHandler = (error, req, res, next) => {
  const errCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(errCode);
  res.json({
    message: `Error: ${error.message}`,
    stack: process.env.NODE_ENV === 'development' && error.stack,
  });
};

export { notFound, errorHandler };
