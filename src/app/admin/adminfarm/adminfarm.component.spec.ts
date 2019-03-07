import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminfarmComponent } from './adminfarm.component';

describe('AdminfarmComponent', () => {
  let component: AdminfarmComponent;
  let fixture: ComponentFixture<AdminfarmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminfarmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminfarmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
