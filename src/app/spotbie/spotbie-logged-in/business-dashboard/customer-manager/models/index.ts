import {User} from '../../../../../models/user';

export interface RecentGuest {
  id: string;
  balance: number;
  user: User & {total_spent_sum: number};
  updated_at: string;
}

export interface SmsGroup {
  id: number;
  body: string;
  user_list?: User[];
  created_at: string;
  total: number;
  total_sent: number;
}

export interface EmailGroup {
  id: number;
  email_body: string;
  user_list?: User[];
  created_at: string;
  total: number;
  total_sent: number;
}
