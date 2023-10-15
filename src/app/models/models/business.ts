import {LoyaltyPointBalance} from './loyalty-point-balance';
import {SpotbieUser} from './spotbieuser';

export class Business {
  id: number;
  user_id: number;
  name: string;
  photo: string;
  description: string;
  address: string;
  loc_x: number;
  loc_y: number;
  created_at: string;
  updated_at: string;
  qr_code_link: string;
  type_of_info_object: string;
  is_community_member: boolean = true;
  cleanCategories: string;
  categories: number[] = [];
  rewardRate: number;
  loyalty_point_dollar_percent_value: number;
  balance: number;
  user_type: number | string;
  trial_ends_at: string;
  spotbie_user: SpotbieUser;
  loyalty_point_balance: LoyaltyPointBalance;
}
