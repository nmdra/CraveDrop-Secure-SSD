import dotenv from 'dotenv';

dotenv.config();

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

export const requireSameOrigin = (req, res, next) => {
    if (safeMethods.has(req.method)) return next();

    const expectedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
    const origin = req.get('origin');

    if (origin !== expectedOrigin) {
        return res.status(403).json({ message: 'Cross-site request blocked' });
    }

    return next();
};
