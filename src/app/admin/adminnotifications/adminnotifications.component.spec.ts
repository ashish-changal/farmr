import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminnotificationsComponent } from './adminnotifications.component';

describe('AdminnotificationsComponent', () => {
  let component: AdminnotificationsComponent;
  let fixture: ComponentFixture<AdminnotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminnotificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminnotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
