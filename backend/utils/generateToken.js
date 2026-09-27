import jwt from 'jsonwebtoken';

const generateToken = (userId, tokenVersion = 0) => {
  return jwt.sign(
    {
      userId,
      tokenVersion,
    },
    process.env.JWT_SECRET,
    {
      // Reduced from the original 30 days.
      expiresIn: '1h',
    }
  );
};

export default generateToken;
