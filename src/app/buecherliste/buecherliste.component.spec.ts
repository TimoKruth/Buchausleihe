import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuecherlisteComponent } from './buecherliste.component';

describe('BuecherlisteComponent', () => {
  let component: BuecherlisteComponent;
  let fixture: ComponentFixture<BuecherlisteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuecherlisteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuecherlisteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
