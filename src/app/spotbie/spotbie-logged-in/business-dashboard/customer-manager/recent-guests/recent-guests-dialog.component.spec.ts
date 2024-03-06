import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentGuestsDialogComponent } from './recent-guests-dialog.component';

describe('RecentGuestsDialogComponent', () => {
  let component: RecentGuestsDialogComponent;
  let fixture: ComponentFixture<RecentGuestsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecentGuestsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentGuestsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
