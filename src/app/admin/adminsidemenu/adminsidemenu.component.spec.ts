import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminsidemenuComponent } from './adminsidemenu.component';

describe('AdminsidemenuComponent', () => {
  let component: AdminsidemenuComponent;
  let fixture: ComponentFixture<AdminsidemenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminsidemenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminsidemenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
