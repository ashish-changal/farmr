import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmnotificationsComponent } from './farmnotifications.component';

describe('FarmnotificationsComponent', () => {
  let component: FarmnotificationsComponent;
  let fixture: ComponentFixture<FarmnotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FarmnotificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmnotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
