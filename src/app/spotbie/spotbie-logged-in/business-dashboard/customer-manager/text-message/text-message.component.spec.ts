import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TextMessageDialogComponent} from './text-message.component';

describe('TextMessageDialogComponent', () => {
  let component: TextMessageDialogComponent;
  let fixture: ComponentFixture<TextMessageDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TextMessageDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextMessageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
