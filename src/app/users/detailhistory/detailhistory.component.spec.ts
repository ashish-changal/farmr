import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailhistoryComponent } from './detailhistory.component';

describe('DetailhistoryComponent', () => {
  let component: DetailhistoryComponent;
  let fixture: ComponentFixture<DetailhistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailhistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailhistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
