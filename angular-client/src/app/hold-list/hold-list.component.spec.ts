import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldListComponent } from './hold-list.component';

describe('HoldListComponent', () => {
  let component: HoldListComponent;
  let fixture: ComponentFixture<HoldListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HoldListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HoldListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
