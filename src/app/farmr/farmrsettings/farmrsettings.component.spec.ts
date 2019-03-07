import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmrsettingsComponent } from './farmrsettings.component';

describe('FarmrsettingsComponent', () => {
  let component: FarmrsettingsComponent;
  let fixture: ComponentFixture<FarmrsettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FarmrsettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmrsettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
