import {Reward} from './reward';
import {LoyaltyPointsLedger} from './loyalty-points-ledger';
import {Business} from './business';
import {SpotbieUser} from "./spotbieuser";

export class Redeemable {
    uuid: string = null;
    redeemed: boolean;
    reward: Reward;
    business: Business;
    total_spent: number;
    dollar_value: number;
    amount: number;
    loyalty_point_dollar_percent_value: number;
    updated_at: string;
    created_at: string;
    loyalty_point_ledger: LoyaltyPointsLedger;
}
