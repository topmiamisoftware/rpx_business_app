import {Preferences} from '@capacitor/preferences';

export const logOutCallback = function (resp: any): void {
  if (resp.success) {
    Preferences.set({
      key: 'spotbie_loggedIn',
      value: '0',
    });
    Preferences.set({
      key: 'spotbie_userApiKey',
      value: null,
    });
    Preferences.set({
      key: 'spotbie_rememberMe',
      value: '0',
    });
    Preferences.set({
      key: 'spotbie_rememberMeToken',
      value: null,
    });
    Preferences.set({
      key: 'spotbie_userType',
      value: null,
    });

    location.href = '/home';
  }
};
