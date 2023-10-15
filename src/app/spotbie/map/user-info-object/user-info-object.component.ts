import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-user-info-object',
  templateUrl: './user-info-object.component.html',
  styleUrls: ['./user-info-object.component.css', '../map.component.css'],
})
export class UserInfoObjectComponent implements OnInit {
  @Input() currentMarker;

  @Output() close = new EventEmitter();

  constructor(private router: Router) {}

  public viewProfile(username: string): void {
    if (username === 'User is a Ghost') {
      return;
    }
    this.router.navigate(['/user-profile/' + username]);
  }

  public closeThis() {
    this.close.emit();
  }

  ngOnInit(): void {}
}
