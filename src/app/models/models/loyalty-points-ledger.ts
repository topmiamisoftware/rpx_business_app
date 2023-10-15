import {Business} from "./business";

export class LoyaltyPointsLedger {
  id: number
  uuid: string;
  user_id: string
  loyalty_amount: number
  from_business: number
  created_at: string
  business: Business
}
