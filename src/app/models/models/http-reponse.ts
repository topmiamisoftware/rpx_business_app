export class HttpResponse {
  constructor(httpResponse: any) {
    this.status = httpResponse.status;
    this.message = httpResponse.status;
    this.full_message = httpResponse.full_message;

    if (httpResponse.responseObject === '') {
      this.responseObject = '';
    } else {
      this.responseObject = httpResponse.responseObject;
    }

    if (httpResponse.apiKey) {
      this.apiKey = httpResponse.apiKey;
    }
  }

  status: string;
  message: string;
  full_message: string;
  responseObject: any;
  apiKey: string;

  httpResponse(arg0: string, httpResponse: any) {
    throw new Error('Method not implemented.');
  }
}
