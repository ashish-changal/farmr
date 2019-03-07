import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmersignupComponent } from './farmersignup.component';

describe('FarmersignupComponent', () => {
  let component: FarmersignupComponent;
  let fixture: ComponentFixture<FarmersignupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FarmersignupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmersignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
