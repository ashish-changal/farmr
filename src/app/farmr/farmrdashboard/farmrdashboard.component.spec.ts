import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmrdashboardComponent } from './farmrdashboard.component';

describe('FarmrdashboardComponent', () => {
  let component: FarmrdashboardComponent;
  let fixture: ComponentFixture<FarmrdashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FarmrdashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmrdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
