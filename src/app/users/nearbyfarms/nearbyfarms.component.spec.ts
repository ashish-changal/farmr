import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NearbyfarmsComponent } from './nearbyfarms.component';

describe('NearbyfarmsComponent', () => {
  let component: NearbyfarmsComponent;
  let fixture: ComponentFixture<NearbyfarmsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NearbyfarmsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NearbyfarmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
