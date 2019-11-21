const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/userModel');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handlerFactory');
const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync( async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get('host')}/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-tours`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [{
      name: `${tour.name} Tour`,
      description: tour.summary,
      // images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
      amount: tour.price * 100,
      currency: 'gbp',
      quantity: 1
    }]
  });

  res.status(200).json({
    status: 'success',
    session
  })
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   const { tour, user, price } = req.params;
//
//   if (!tour || !user || !price) return next();
//   await Booking.create({ tour, user, price });
//
//   res.redirect(req.originalUrl.split('?')[0]);
// });

const createBookingCheckout = async session => {
  const tourId = session.client_reference_id;
  const userId = (await User.findOne({ email: session.customer_email })).id;
  const price = session.line_items[0].amount * 100;
  await Booking.create({ tourId, userId, price });
};


exports.webhookCheckout = catchAsync(async (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  const event = stripe.webhooks.constructEvent(
    req.body,
    signature,
    process.env.STRIPE_SECRET_KEY
  );

  if (event.type === 'checkout.session.completed')
    await createBookingCheckout(event.data.object);

  res.status(200).json({
    received: true
  });
});

exports.getBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
