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
  lp_balance_list: LoyaltyPointBalance[];
  loyalty_point_balance: any;
  next_payment: string;
}

export enum BusinessMembership {
  Starter = 'spotbie.business_subscription_price1',
  Intermediate = 'spotbie.business_subscription_price_1_2',
  Ultimate = 'spotbie.business_subscription_price_2_2',
  Legacy = 'spotbie.business_subscription_price',
}
