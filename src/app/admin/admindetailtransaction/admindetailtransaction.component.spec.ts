import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmindetailtransactionComponent } from './admindetailtransaction.component';

describe('AdmindetailtransactionComponent', () => {
  let component: AdmindetailtransactionComponent;
  let fixture: ComponentFixture<AdmindetailtransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdmindetailtransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdmindetailtransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
