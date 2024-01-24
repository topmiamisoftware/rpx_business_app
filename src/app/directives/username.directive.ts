import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
 selector: '[username]'
})
export class UsernameDirective {
    constructor(public ref: ElementRef) { }

    @HostListener('input', ['$event']) onInput(event) {
        const regex = /^[a-zA-Z0-9]*$/
        const replaceRegex = /[^a-zA-Z0-9/-]+/
        let str = event.target.value

        // allow letters and numbers only.
        if(!regex.test(event.key)){
            str = str.replace(replaceRegex, "") 
            this.ref.nativeElement.value = str
            event.preventDefault()
        }
    }

    @HostListener('input', ['$event']) onBlur(event) {
        const replaceRegex = /[^a-zA-Z0-9/-]+/
        const str = event.target.value.replace(replaceRegex, "")
        event.target.value = str
    }
}
