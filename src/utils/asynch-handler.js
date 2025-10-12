const asyncHandler = (fn) => (req, res, next) => {
    return (req, res, next).catch(next);
    
}

export default asyncHandler;
