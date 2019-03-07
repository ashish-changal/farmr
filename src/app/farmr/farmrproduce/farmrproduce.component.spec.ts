import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmrproduceComponent } from './farmrproduce.component';

describe('FarmrproduceComponent', () => {
  let component: FarmrproduceComponent;
  let fixture: ComponentFixture<FarmrproduceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FarmrproduceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmrproduceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
