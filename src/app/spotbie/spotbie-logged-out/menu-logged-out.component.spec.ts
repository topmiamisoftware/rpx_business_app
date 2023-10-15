import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuLoggedOutComponent } from './menu-logged-out.component';

describe('MenuLoggedOutComponent', () => {
  let component: MenuLoggedOutComponent;
  let fixture: ComponentFixture<MenuLoggedOutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuLoggedOutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuLoggedOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
