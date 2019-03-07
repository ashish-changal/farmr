import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddnewfarmComponent } from './addnewfarm.component';

describe('AddnewfarmComponent', () => {
  let component: AddnewfarmComponent;
  let fixture: ComponentFixture<AddnewfarmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddnewfarmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddnewfarmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
