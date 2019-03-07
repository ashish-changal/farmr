import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmrsidemenuComponent } from './farmrsidemenu.component';

describe('FarmrsidemenuComponent', () => {
  let component: FarmrsidemenuComponent;
  let fixture: ComponentFixture<FarmrsidemenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FarmrsidemenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmrsidemenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
