const express = require('express');
const userController = require('./../Controller/userController');
const authController = require('./../Controller/authController');
const router = express.Router();




//auth controller
router.post('/signup', authController.Signup);
router.post('/login', authController.Login);
router.get('/logout', authController.logout);

router.post('/forgottenPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);

router.patch('/updateMe',userController.updateUserPhoto,userController.resizeUserPhoto,userController.updateMe);
//deactivate
router.delete('/deleteMe', userController.deleteMe);

router.get(
  '/me',
  userController.getMe,
  userController.getUser
);

//Restrict some routes after above moddleware
router.use(authController.restrictTo('admin'))

router.route('/').get(userController.getAllUsers).post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
