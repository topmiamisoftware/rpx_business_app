import {Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-nearby-ads-three',
  templateUrl: './nearby-ads-three.component.html',
  styleUrls: ['./nearby-ads-three.component.css'],
})
export class NearbyAdsThreeComponent implements OnInit {
  @Input() lat: number = null;
  @Input() lng: number = null;
  @Input() set accountType(accountType: number | string) {
    this.accountType$.next(accountType);
  }
  @Input() eventsClassification: number = null;
  @Input() categories: any;

  accountType$: BehaviorSubject<number | string | null> = new BehaviorSubject(
    null
  );

  constructor() {}

  ngOnInit(): void {}
}
