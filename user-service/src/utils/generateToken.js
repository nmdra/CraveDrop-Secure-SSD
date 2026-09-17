import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

// In-memory store for refresh tokens (for demo; use DB/Redis in real apps)
// const refreshTokenStore = new Map();

export const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        secretKey,
        { algorithm: 'HS256', expiresIn: '3h' }
    );
    const refreshToken = jwt.sign(
        { userId },
        refreshSecret,
        { algorithm: 'HS256', expiresIn: '1d' }
    );

    // refreshTokenStore.set(userId, refreshToken);

    return { accessToken, refreshToken };
};

export const verifyRefreshToken = (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, refreshSecret, {
            algorithms: ['HS256']
        });
        // const storedToken = refreshTokenStore.get(decoded.user.userId);
        // if (storedToken !== refreshToken) return null;
        return decoded.userId;
    } catch {
        return null;
    }
};
