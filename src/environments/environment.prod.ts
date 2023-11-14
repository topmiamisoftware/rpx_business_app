const baseUrl = 'https://spotbie.com/';
const apiEndpoint = 'https://api.spotbie.com/api/';

export const environment = {
  production: true,
  staging: false,
  baseUrl,
  versionCheckURL: baseUrl + 'version.json',
  googleMapsApiKey: 'AIzaSyC4Su0B2cBzsSpAF-Kphq_78uR8b5eA4_Q',
  googlePlacesApiAkey: 'AIzaSyChSn9IE6Dp0Jv8TS013np1b4X1rCsQt_E',
  mapId: 'mapId',
  apiEndpoint,
  qrCodeLoyaltyPointsScanBaseUrl: baseUrl + 'loyalty-points',
  qrCodeRewardScanBaseUrl: baseUrl + 'reward',
  ngrok: null,
  fakeLocation: false,
  myLocX: 25.786286,
  myLocY: -80.186562,
  publishableStripeKey:
    'pk_live_51JrUwnGFcsifY4UhqQVtkwnats9SfiUseYMsCBpoa7361hvxq4uWNZcxL2nZnhhrqtX5vLs9EUFACK3VR60svKyc00BSbooqh8',
};
