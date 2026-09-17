import { Router } from 'express';
import { registerUser, getUserProfile, updateUser, deleteUserAccount, getUserById } from '../controllers/userController.js';
import { auth, logout, refreshToken, validate } from '../controllers/authController.js';
import { registerUserValidator, updateUserValidator } from '../validators/userValidators.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { requireSameOrigin } from '../middleware/originMiddleware.js';

const router = Router();

// User routes
router
    .route('')
    .put(requireSameOrigin, authenticateUser, updateUserValidator, updateUser)
    .delete(requireSameOrigin, authenticateUser, deleteUserAccount)
    .get(authenticateUser, getUserProfile)

router.route('/register').post(registerUserValidator, registerUser)

// Auth routes
router.route('/auth').post(auth)
router.route('/refresh').post(requireSameOrigin, refreshToken);
router.route('/validate').get(validate)
router.route('/logout').post(requireSameOrigin, logout)

// router.route('/:id').get(getUserById)

export default router;
