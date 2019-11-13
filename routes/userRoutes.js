const router = require('express').Router();
const tourController = require('./../controllers/userController');

router
  .route('/')
  .get(tourController.getUsers)
  .post(tourController.createUser);

router
  .route('/:id')
  .get(tourController.getUser)
  .patch(tourController.updateUser)
  .delete(tourController.deleteUser);

module.exports = router;
