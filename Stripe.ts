// stripe.ts
import { useStripe } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY } from './StripeConfig';

const stripe = useStripe();

export default stripe;