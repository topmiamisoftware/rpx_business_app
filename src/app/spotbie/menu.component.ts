import { Component, OnInit, ViewChild, Input } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit {

  @Input() public_profile_info : any
  @Input() album_id : string
  @Input() album_media_id : string  

  @ViewChild('spotbieMainMenu') spotbieMainMenu

  @ViewChild('spotbieHoveredApp') spotbieHoveredApp

  public public_profile : boolean

  public isLoggedIn: boolean = false

  constructor() { }

  ngOnInit() {

    // save timezone
    const userTimezone =  Intl.DateTimeFormat().resolvedOptions().timeZone
    localStorage.setItem('spotbie_userTimeZone', userTimezone)

    // check log in status, turn map on if we are logged out
    const cookiedLoggedIn = localStorage.getItem('spotbie_loggedIn')

    if (cookiedLoggedIn == '1') this.isLoggedIn = true

  }

  ngAfterViewInit() {}
  
}