import { SpotbieUser } from './spotbieuser'
import { Business } from './business'
import {LoyaltyPointBalance} from './loyalty-point-balance';

export class User {
  id: number;
  uuid: string;
  username: string;
  email: string;
  ends_at: string;
  trial_ends_at: string;
  created_at: string;
  updated_at: string;
  spotbie_user: SpotbieUser;
  business: Business;
  loyalty_point_balance: LoyaltyPointBalance;
  next_payment: string;
  userSubscriptionPlan: BusinessMembership;
}

export enum BusinessMembership {
  Starter = 'spotbie.business_subscription_price1',
  Intermediate = 'spotbie.business_subscription_price_1_2',
  Ultimate = 'spotbie.business_subscription_price_2_2',
  Legacy = 'spotbie.business_subscription_price',
}
