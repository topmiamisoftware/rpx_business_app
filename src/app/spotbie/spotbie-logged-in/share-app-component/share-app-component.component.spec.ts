import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareAppComponentComponent } from './share-app-component.component';

describe('ShareAppComponentComponent', () => {
  let component: ShareAppComponentComponent;
  let fixture: ComponentFixture<ShareAppComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShareAppComponentComponent]
    });
    fixture = TestBed.createComponent(ShareAppComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
