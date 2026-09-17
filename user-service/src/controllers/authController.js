import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import userRepo from '../repositories/userRepository.js';
import { generateTokens, verifyRefreshToken } from '../utils/generateToken.js';
import bcrypt from 'bcrypt';

const cookieOptions = (maxAge) => ({
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV !== 'development',
    maxAge,
    path: '/',
});

export const auth = async (req, res) => {
    const { email, password } = req.body;

    const user = await userRepo.findByEmail(email);
    if (!user) return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user.userId);

    res
        .cookie('accessToken', accessToken, cookieOptions(3 * 60 * 60 * 1000))
        .cookie('refreshToken', refreshToken, cookieOptions(24 * 60 * 60 * 1000))
        .status(StatusCodes.OK)
        .json({
            status: 'success',
            user: {
                userId: user.userId,
                firstname: user.firstname,
                pic: user.pic,
            },
        });
}

export const refreshToken = (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Missing refresh token' });
    const userId = verifyRefreshToken(refreshToken);
    if (!userId) return res.status(StatusCodes.FORBIDDEN).json({ message: 'Invalid or expired refresh token' });

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(userId);

    res
        .cookie('accessToken', accessToken, cookieOptions(3 * 60 * 60 * 1000))
        .cookie('refreshToken', newRefreshToken, cookieOptions(24 * 60 * 60 * 1000))
        .status(StatusCodes.OK)
        .json({
            status: 'success',
            message: 'Token Refreshed.',
        });
}

export const validate = (req, res) => {
    const token = req.cookies?.accessToken;
    if (!token) return res.sendStatus(StatusCodes.UNAUTHORIZED);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256']
        });
        res.setHeader('X-User-Id', decoded.userId);
        return res.sendStatus(StatusCodes.OK);
    } catch {
        return res.sendStatus(StatusCodes.UNAUTHORIZED);
    }
}

export const logout = (req, res) => {
    res.clearCookie('accessToken', cookieOptions(0));
    res.clearCookie('refreshToken', cookieOptions(0));

    res.status(StatusCodes.OK).json({
        status: 'success',
        message: 'Logged out successfully.',
    });
}
