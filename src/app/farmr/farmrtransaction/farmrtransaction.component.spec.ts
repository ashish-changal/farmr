import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmrtransactionComponent } from './farmrtransaction.component';

describe('FarmrtransactionComponent', () => {
  let component: FarmrtransactionComponent;
  let fixture: ComponentFixture<FarmrtransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FarmrtransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmrtransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
