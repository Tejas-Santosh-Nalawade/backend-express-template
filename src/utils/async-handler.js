// A utility to handle async request handlers and forward errors to Express error handler

const asyncHandler = (requestHandler) => (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(err =>  next(err));
};

export {asyncHandler};
