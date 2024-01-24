import {Business} from './business';

export class LoyaltyPointBalance {
    private _balance: number = null
    private _reset_balance: number = null
    private _loyalty_point_dollar_percent_value: number = null
    private _end_of_month: string = null
    updated_at: string
    from_business: Business

    get balance(): number {
        return this._balance
    }
    set balance(value: number) {
        this._balance = value
    }

    get reset_balance(): number {
        return this._reset_balance
    }
    set reset_balance(value: number) {
        this._reset_balance = value
    }

    get loyalty_point_dollar_percent_value(): number {
        return this._loyalty_point_dollar_percent_value
    }
    set loyalty_point_dollar_percent_value(value: number) {
        this._loyalty_point_dollar_percent_value = value
    }
}

