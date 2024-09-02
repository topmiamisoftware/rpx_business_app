const baseUrl = 'https://demo.spotbie.com/';
const apiEndpoint = 'https://api-demo.spotbie.com/api/';

export const environment = {
  production: false,
  staging: true,
  baseUrl,
  versionCheckURL: baseUrl + 'version.json',
  google_maps_apiKey: '',
  google_places_apiAkey: '',
  mapId: 'mapId',
  apiEndpoint,
  businessClientApp: null,
  personalClientApp: null,
  qrCodeLoyaltyPointsScanBaseUrl: baseUrl + 'loyalty-points',
  qrCodeRewardScanBaseUrl: baseUrl + 'reward',
  ngrok: null,
  fakeLocation: true,
  myLocX: 25.786286,
  myLocY: -80.186562,
  publishableStripeKey: null,
  dsn: null, // Sentry client key,
  installedVersion: '3',
};

setEnvironmentVariables(environment.production);

function setEnvironmentVariables(isProduction: boolean) {
  if (!isProduction) {
    environment.fakeLocation = true;
    environment.apiEndpoint = 'https://api-demo.spotbie.com/api/';
    environment.businessClientApp = 'https://business-demo.spotbie.com/';
    environment.personalClientApp = 'https://personal-demo.spotbie.com/';
    environment.publishableStripeKey = '';
    environment.dsn = null;
  }

  if (isProduction) {
    environment.fakeLocation = false;
    environment.apiEndpoint = 'https://api.spotbie.com/api/';
    environment.businessClientApp = 'https://business.spotbie.com/';
    environment.personalClientApp = 'https://home.spotbie.com/';
    environment.publishableStripeKey =
      '';
    environment.dsn =
      '';
    environment.installedVersion = '';
  }
}
