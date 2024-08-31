const baseUrl = "https://spotbie.com/";
const apiEndpoint = "https://api-demo.spotbie.com/api/";
// const apiEndpoint = 'https://d6f3-2601-586-cd00-7900-b9c5-ae4f-98a6-739c.ngrok-free.app ';
export const environment = {
  production: true,
  staging: false,
  baseUrl,
  googleMapsApiKey: "AIzaSyC4Su0B2cBzsSpAF-Kphq_78uR8b5eA4_Q",
  googlePlacesApiAkey: "AIzaSyChSn9IE6Dp0Jv8TS013np1b4X1rCsQt_E",
  mapId: "mapId",
  apiEndpoint,
  qrCodeLoyaltyPointsScanBaseUrl: baseUrl + "loyalty-points",
  qrCodeRewardScanBaseUrl: baseUrl + "reward",
  ngrok: null,
  fakeLocation: false,
  myLocX: 25.786286,
  myLocY: -80.186562,
  publishableStripeKey:
    "pk_live_51JrUwnGFcsifY4UhqQVtkwnats9SfiUseYMsCBpoa7361hvxq4uWNZcxL2nZnhhrqtX5vLs9EUFACK3VR60svKyc00BSbooqh8",
  installedVersion: '3'
};
