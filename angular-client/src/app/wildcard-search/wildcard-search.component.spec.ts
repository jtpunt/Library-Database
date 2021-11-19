import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WildcardSearchComponent } from './wildcard-search.component';

describe('WildcardSearchComponent', () => {
  let component: WildcardSearchComponent;
  let fixture: ComponentFixture<WildcardSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WildcardSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WildcardSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
