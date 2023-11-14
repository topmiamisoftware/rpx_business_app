// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
/*const ngrok =
  'https://1446-2601-586-cd80-6e0-8f4e-c712-4713-e036.ngrok-free.app/';*/
const ngrok = 'https://api.spotbie.com/';
const baseUrl = 'https://spotbie.com/';

export const environment = {
  production: true,
  staging: false,
  baseUrl,
  googleMapsApiKey: 'AIzaSyBg9GGAv2rRn8WQbylRbpF4j6u-9TFxBG8',
  googlePlacesApiAkey: 'AIzaSyChSn9IE6Dp0Jv8TS013np1b4X1rCsQt_E',
  mapId: 'IDe50e7edb94949c5',
  qrCodeLoyaltyPointsScanBaseUrl: baseUrl + 'loyalty-points',
  qrCodeRewardScanBaseUrl: baseUrl + 'reward',
  publishableStripeKey:
    'pk_test_51JrUwnGFcsifY4UhCCJp023Q1dWwv5AabBTsMDwiJ7RycEVLyP1EBpwbXRsfn07qpw5lovv9CGfvfhQ82Zt3Be8U00aH3hD9pj',
  apiEndpoint: `${ngrok}api/`,
  fakeLocation: false,
  myLocX: 25.786286,
  myLocY: -80.186562,
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */

import 'zone.js/dist/zone-error'; // Included with Angular CLI.
