import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FarminformationComponent } from './farminformation.component';

describe('FarminformationComponent', () => {
  let component: FarminformationComponent;
  let fixture: ComponentFixture<FarminformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FarminformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FarminformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
