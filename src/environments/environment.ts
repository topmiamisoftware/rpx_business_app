// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

const ngrok = "https://4249-2601-586-cd00-7900-942a-3054-dfb4-a324.ngrok-free.app/";
// const ngrok = "https://api-demo.spotbie.com/";
// const ngrok = "https://api.spotbie.com/";

const baseUrl = "http://localhost:55233/";
// const baseUrl = "https://business-demo.spotbie.com/";
// const baseUrl = "https://spotbie.com/";

export const environment = {
  production: true,
  staging: false,
  baseUrl,
  googleMapsApiKey: "",
  googlePlacesApiAkey: "",
  mapId: "",
  qrCodeLoyaltyPointsScanBaseUrl: baseUrl + "loyalty-points",
  qrCodeRewardScanBaseUrl: baseUrl + "reward",
  publishableStripeKey: "",
  apiEndpoint: `${ngrok}api/`,
  fakeLocation: true,
  myLocX: null,
  myLocY: null,
  installedVersion: ''
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */

import "zone.js/dist/zone-error"; // Included with Angular CLI.
