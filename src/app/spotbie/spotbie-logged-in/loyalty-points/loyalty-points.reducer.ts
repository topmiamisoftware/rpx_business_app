import { createReducer, on } from '@ngrx/store';
import { setValue } from './loyalty-points.actions';

export const initialState: number = 0;

const _loyaltyPointsReducer = createReducer(
  initialState,
  on(setValue, (state, { loyaltyPointBalance }) => loyaltyPointBalance),
);

export function loyaltyPointsReducer(state, action) {
  return _loyaltyPointsReducer(state, action);
}
