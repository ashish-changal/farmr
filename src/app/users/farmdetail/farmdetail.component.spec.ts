import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmdetailComponent } from './farmdetail.component';

describe('FarmdetailComponent', () => {
  let component: FarmdetailComponent;
  let fixture: ComponentFixture<FarmdetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FarmdetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmdetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
