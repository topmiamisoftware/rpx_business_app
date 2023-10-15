import {LoyaltyTier} from "./loyalty-point-tier.balance";

export class Reward {
    id: number;
    uuid: string;
    type: number;
    name: string;
    description: string;
    images: string;
    point_cost: number;
    link: string;
    tier_id: number;
}
