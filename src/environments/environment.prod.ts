const baseUrl = 'https://business.spotbie.com/';
const apiEndpoint = 'https://api.spotbie.com/api/';

export const environment = {
  production: true,
  staging: false,
  fakeLocation: false,
  baseUrl,
  versionCheckURL: baseUrl + 'version.json',
  google_maps_apiKey: 'AIzaSyC4Su0B2cBzsSpAF-Kphq_78uR8b5eA4_Q',
  google_places_apiAkey: 'AIzaSyBJ92ICDSvm_MVvwU-8fkPF62rWy-9xrL0',
  mapId: 'mapId',
  apiEndpoint,
  businessClientApp: null,
  personalClientApp: null,
  qrCodeLoyaltyPointsScanBaseUrl: baseUrl + 'loyalty-points',
  qrCodeRewardScanBaseUrl: baseUrl + 'reward',
  ngrok: null,
  myLocX: 25.786286,
  myLocY: -80.186562,
  publishableStripeKey: null,
  dsn: null, // Sentry client key,
  installedVersion: '8',
  promoter: {
    deviceId: 'franco_petitfour'
  }
};

setEnvironmentVariables(environment.production);

function setEnvironmentVariables(isProduction: boolean) {
  if (!isProduction) {
    environment.baseUrl = 'https://demo.spotbie.com/';
    environment.fakeLocation = true;
    environment.apiEndpoint = 'https://api-demo.spotbie.com/api/';
    environment.businessClientApp = 'https://business-demo.spotbie.com/';
    environment.personalClientApp = 'https://personal-demo.spotbie.com/';
    environment.publishableStripeKey =
      'pk_test_51JrUwnGFcsifY4UhCCJp023Q1dWwv5AabBTsMDwiJ7RycEVLyP1EBpwbXRsfn07qpw5lovv9CGfvfhQ82Zt3Be8U00aH3hD9pj';
    environment.dsn = 'https://c6d5bdc07a204911a0af930dbc444c5e@o4504285868523520.ingest.us.sentry.io/4504285940809728';
  }

  if (isProduction) {
    environment.baseUrl = 'https://spotbie.com/';
    environment.fakeLocation = false;
    environment.apiEndpoint = 'https://api.spotbie.com/api/';
    environment.businessClientApp = 'https://business.spotbie.com/';
    environment.personalClientApp = 'https://home.spotbie.com/';
    environment.publishableStripeKey =
      'pk_live_51JrUwnGFcsifY4UhqQVtkwnats9SfiUseYMsCBpoa7361hvxq4uWNZcxL2nZnhhrqtX5vLs9EUFACK3VR60svKyc00BSbooqh8';
    environment.dsn =
      'https://c6d5bdc07a204911a0af930dbc444c5e@o4504285868523520.ingest.sentry.io/4504285940809728';
    environment.installedVersion = '8';
  }
}
