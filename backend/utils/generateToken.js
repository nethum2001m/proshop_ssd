import jwt from 'jsonwebtoken';

const generateToken = (userId, tokenVersion = 0) =>
  jwt.sign({ userId, tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

export default generateToken;

