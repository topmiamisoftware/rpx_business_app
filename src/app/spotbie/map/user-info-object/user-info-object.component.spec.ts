import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserInfoObjectComponent } from './user-info-object.component';

describe('UserInfoObjectComponent', () => {
  let component: UserInfoObjectComponent;
  let fixture: ComponentFixture<UserInfoObjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserInfoObjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserInfoObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
