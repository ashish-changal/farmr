import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmraddproduceComponent } from './farmraddproduce.component';

describe('FarmraddproduceComponent', () => {
  let component: FarmraddproduceComponent;
  let fixture: ComponentFixture<FarmraddproduceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FarmraddproduceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmraddproduceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
