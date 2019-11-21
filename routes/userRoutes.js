const router = require('express').Router();
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

router.post(
  '/signup',
  authController.signup
);
router.post(
  '/login',
  authController.login
);
router.get(
  '/logout',
  authController.logout
);
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);
router.post(
  '/forgotPassword',
  authController.forgotPassword);
router.patch(
  '/resetPassword/:token',
  authController.resetPassword
);

// Authenticated routes
router.use(authController.protect);

router.get(
  '/me',
  userController.getMe,
  userController.getUser
);
router.patch(
  '/updateMe',
  userController.uploadImage,
  userController.processUserImage,
  userController.updateMe
);
router.delete(
  '/deleteMe',
  userController.deleteMe
);

// Restricted routes
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
