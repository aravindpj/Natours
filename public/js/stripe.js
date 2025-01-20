import axios from 'axios';
import { showAlert } from './alert';

export const booking = async function (tourId) {

  try {
    const stripe = Stripe(
        'pk_test_51MQ9g8SD65j4T1RFf0OFdOINFt4olRgbmfvnR0QL60VKB2OFfQdTnuKEhZEuf1JscqkqCQwQo1ZTbawxUJbOWSMq00Rxw6ZFAz'
      );
    // 1) get check out session from API
    const session = await axios(
      `http://localhost:4000/api/v1/bookings/checkout-session/${tourId}`
    );
   
    // 2) create checkout form
    await stripe.redirectToCheckout({
        sessionId:session.data.session.id
    })

  } catch (error) {
    showAlert('error', error);
  }
};
