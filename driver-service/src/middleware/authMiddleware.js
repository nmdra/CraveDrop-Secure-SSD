import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import Driver from '../models/driver.js';

// Protect routes - verify JWT token and set req.driver
const protect = async (req, res, next) => {
  let token;
  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];
      // Pin token verification to the algorithm used by this service.
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256']
      });

      // Load the actor from the signed subject; request parameters cannot
      // choose which authenticated driver is attached to the request.
      req.driver = await Driver.findById(decoded.id).select('-password');

      if (!req.driver) {
        res.status(StatusCodes.UNAUTHORIZED);
        const error = new Error('Not authorized, driver not found');
        return next(error);
      }

      next();
    } catch (error) {
      console.error('Driver authentication failed');
      res.status(StatusCodes.UNAUTHORIZED);
      return next(new Error('Not authorized, token failed'));
    }
  } else {
    res.status(StatusCodes.UNAUTHORIZED);
    return next(new Error('Not authorized, no token provided'));
  }
};

export { protect };
