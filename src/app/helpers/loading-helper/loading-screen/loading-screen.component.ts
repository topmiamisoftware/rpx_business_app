import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.css']
})
export class LoadingScreenComponent implements OnInit {

  @Input('loadingText') loadingText: string = 'LOADING...';

  constructor() { }

  ngOnInit(): void {
  }
}
