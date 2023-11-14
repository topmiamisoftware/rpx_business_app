import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  @Output() locationPrompted = new EventEmitter();

  public currentCard = 0;

  constructor() { }

  public switchCard(){
    this.locationPrompted.emit();
  }

  public whichCard(card: number){

    if(card === this.currentCard)
      {return { display : 'block' };}
    else
      {return { display : 'none' };}

  }

  ngOnInit(): void {}

}
