import { Directive,ElementRef, HostListener } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
 selector: '[personName]',
 providers: [NgModel]
})
export class PersonNameDirective {

    constructor(public ref: ElementRef) { }

    @HostListener('input', ['$event']) lettersAndSpacesOnly(event) {

        let regex = /^[a-zA-Z\s]*$/
        let replaceRegex = /[^a-zA-Z\s]+/
        let str = event.target.value

        // allow letters and spaces only.
        if(!regex.test(event.key)){
            str = str.replace(replaceRegex, "") 
            this.ref.nativeElement.value = str
            event.preventDefault()
        }

    }

    @HostListener('input', ['$event']) replaceInvalidCharacters(event) {

        let replaceRegex = /[^a-zA-Z\s]+/
        let str = event.target.value.replace(replaceRegex, "")
        event.target.value = str

    }

}