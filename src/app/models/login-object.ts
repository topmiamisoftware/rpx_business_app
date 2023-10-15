export class LoginObject {

    private _exe_username: string; // (35)
    private _exe_user_password: string; // (35)
    private _exe_remember_me: boolean; // (1)
    private _exe_remember_me_token: string; // (128)
    private _exe_action: string;
    private _exe_user_time_zone: string;

    constructor() {}

    get exe_action(): string {
        return this._exe_action;
    }
    set exe_action(value: string) {
        this._exe_action = value;
    }

    get exe_username(): string {
        return this._exe_username;
    }
    set exe_username(value: string) {
        this._exe_username = value;
    }

    get exe_user_password(): string {
        return this._exe_user_password;
    }
    set exe_user_password(value: string) {
        this._exe_user_password = value;
    }

    get exe_remember_me(): boolean {
        return this._exe_remember_me;
    }
    set exe_remember_me(value: boolean) {
        this._exe_remember_me = value;
    }

    get exe_remember_me_token(): string {
        return this._exe_remember_me_token;
    }
    set exe_remember_me_token(value: string) {
        this._exe_remember_me_token = value;
    }

    get exe_user_time_zone(): string {
        return this._exe_user_time_zone;
    }
    set exe_user_time_zone(value: string) {
        this._exe_user_time_zone = value;
    }

}
