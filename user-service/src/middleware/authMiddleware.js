import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const authenticateUser = (req, res, next) => {
    const token = req.cookies?.accessToken;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No session provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256']
        });
        req.userId = decoded.userId;
        next();
    } catch {
        res.status(401).json({ message: 'Unauthorized: Invalid or expired session' });
    }
};
