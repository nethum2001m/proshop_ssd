import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/UserModel.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer ')
  ) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    token = req.headers.authorization.split(' ')[1];

    // 1. Verify JWT signature and expiry
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // 2. Load the current user
    const user = await User.findById(
      decoded.userId
    ).select('-password');

    if (!user) {
      res.status(401);
      throw new Error('User no longer exists');
    }

    const databaseTokenVersion =
      user.tokenVersion || 0;

    // 3. Reject old or revoked JWTs
    if (
      typeof decoded.tokenVersion !== 'number' ||
      decoded.tokenVersion !== databaseTokenVersion
    ) {
      res.status(401);
      throw new Error(
        'Session has been revoked. Please sign in again.'
      );
    }

    req.user = user;

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);

    if (res.statusCode !== 401) {
      res.status(401);
    }

    throw new Error(
      error.message ===
        'Session has been revoked. Please sign in again.'
        ? error.message
        : 'Not authorized - token has failed.'
    );
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
