import { Observable, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export function displayError(error) {
    console.log('SpotBie Error : ', error);
}

export function displayToast(toast_message : string) : void{

    const new_div = document.getElementById('spotbieToastErrorMsg');
    new_div.innerHTML = toast_message;
    document.getElementById('spotbieToastErrorOverlay').style.display = 'block';

    setTimeout(() => {
        dismissToast()
    }, 2000)
}

export function dismissToast() : void{
    document.getElementById('spotbieToastErrorOverlay').style.display = 'none';
}

export function handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      // this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
}

export const fromErrorResponse = (errorResponse: HttpErrorResponse) => {

    // 1 - Create empty array to store errors
    const errors = [];

    // 2 - check if the error object is present in the response
    if (errorResponse.error) {

      // 3 - Push the main error message to the array of errors
      errors.push(errorResponse.error.message);

      // 4 - Check for Laravel form validation error messages object
      if (errorResponse.error.errors) {

        // 5 - For each error property (which is a form field)
        for (const property in errorResponse.error.errors) {

          if (errorResponse.error.errors.hasOwnProperty(property)) {

            // 6 - Extract it's array of errors
            const propertyErrors: Array<string> = errorResponse.error.errors[property];

            // 7 - Push all errors in the array to the errors array
            propertyErrors.forEach(error => errors.push(error));
          }

        }

      }

    }

    return errors;

  };
