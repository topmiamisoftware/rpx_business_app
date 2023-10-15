export class HttpResponse {

    constructor(httpResponse : any) {

        this.status = httpResponse.status
        this.message = httpResponse.status
        this.full_message = httpResponse.full_message

        if (httpResponse.responseObject == '')
          this.responseObject = ''
        else
          this.responseObject = JSON.parse(httpResponse.responseObject)

        if(httpResponse.apiKey) this.apiKey = httpResponse.apiKey

    }

    public status : string
    public message : string
    public full_message : string
    public responseObject : any
    public apiKey : string

    httpResponse(arg0 : string, httpResponse : any) {
      throw new Error('Method not implemented.')
    }

}