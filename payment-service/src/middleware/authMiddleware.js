import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authenticatePaymentUser = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authorization.slice('Bearer '.length).trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.userId) {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }

    req.userId = decoded.userId;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired authentication token' });
  }
};
