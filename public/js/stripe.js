import axios from 'axios';
import { showAlert } from './alert';


export const bookTour = async tourId => {
  const stripe = Stripe('pk_test_lko1xHfix54zATyT9Vda85xe008bYlPs4f');
  try {
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`
    );

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('Error', err);
  }

};


