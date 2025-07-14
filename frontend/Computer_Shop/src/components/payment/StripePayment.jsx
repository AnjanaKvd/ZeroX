import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentIntent } from '../../services/paymentService';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';

// Load Stripe.js asynchronously
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripePayment = ({ orderId, amount, onPaymentSuccess, onPaymentError }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    // Create PaymentIntent as soon as the component mounts
    const createPayment = async () => {
      try {
        setProcessing(true);
        const { clientSecret } = await createPaymentIntent({
          orderId,
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'lkr',
        });
        setClientSecret(clientSecret);
      } catch (err) {
        setError('Failed to initialize payment. Please try again.');
        onPaymentError && onPaymentError(err);
      } finally {
        setProcessing(false);
      }
    };

    if (amount > 0) {
      createPayment();
    }
  }, [amount, orderId, onPaymentError]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // First create a payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Could not create payment method');
      }

      // Then confirm the payment with the PaymentIntent
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethod.id,
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message || 'Payment failed');
      }

      if (paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent);
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      onPaymentError && onPaymentError(new Error(errorMessage));
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  return (
    <div className="stripe-payment-form mt-4">
      <form onSubmit={handleSubmit}>
        <div className="mb-4 p-4 border rounded bg-gray-50">
          <CardElement options={cardElementOptions} />
        </div>
        
        {error && (
          <div className="text-red-600 text-sm mb-4">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={!stripe || processing || !clientSecret}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${(!stripe || processing) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {processing ? 'Processing...' : `Pay LKR${amount.toFixed(2)}`}
        </button>
        
        {/* <div className="text-xs text-gray-500 mt-2">
          Test card: 4242 4242 4242 4242 - Any future date - Any 3 digits - Any zip
        </div> */}
      </form>
    </div>
  );
};

export default StripePayment;

// Export the StripePromise for use in the OrderConfirmation component
export { stripePromise };

// Higher-order component to wrap with Elements provider
export const StripePaymentWrapper = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <StripePayment {...props} />
    </Elements>
  );
};
