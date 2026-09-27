import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/UserModel.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer')
  ) {
    res.status(401);
    throw new Error('Not authorized, no token!');
  } else {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.userId).select('-password');

      if (!req.user || (req.user.tokenVersion || 0) !== (decoded.tokenVersion || 0)) {
        res.status(401);
        throw new Error('Not authorized - session expired or invalidated.');
      }

      next();
    } catch (error) {
      console.error('Error:', error);
      res.status(401);
      throw new Error('Not authorized - token has failed.');
    }
  }
});

const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized with role of admin!');
  }
};

export { protect, isAdmin };
