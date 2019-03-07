import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingfarmsComponent } from './pendingfarms.component';

describe('PendingfarmsComponent', () => {
  let component: PendingfarmsComponent;
  let fixture: ComponentFixture<PendingfarmsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingfarmsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingfarmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
