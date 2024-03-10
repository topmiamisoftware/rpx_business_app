import {Business} from './business';

export class LoyaltyPointBalance {
  balance: number = null;
  reset_balance: number = null;
  loyalty_point_dollar_percent_value: number = null;
  end_of_month: string = null;
  updated_at: string;
  from_business: Business;
  loyalty_point_amt?: number;
}
