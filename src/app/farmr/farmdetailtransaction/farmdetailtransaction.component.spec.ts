import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmdetailtransactionComponent } from './farmdetailtransaction.component';

describe('FarmdetailtransactionComponent', () => {
  let component: FarmdetailtransactionComponent;
  let fixture: ComponentFixture<FarmdetailtransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FarmdetailtransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmdetailtransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
