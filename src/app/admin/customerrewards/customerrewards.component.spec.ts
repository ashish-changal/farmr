import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerrewardsComponent } from './customerrewards.component';

describe('CustomerrewardsComponent', () => {
  let component: CustomerrewardsComponent;
  let fixture: ComponentFixture<CustomerrewardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerrewardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerrewardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
