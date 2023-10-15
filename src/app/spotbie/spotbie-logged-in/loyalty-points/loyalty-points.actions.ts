import { createAction, props } from '@ngrx/store';

export const setValue = createAction(
    '[Loyalty Points Component] Set Value',
    props<{ loyaltyPointBalance: number }>()
);
