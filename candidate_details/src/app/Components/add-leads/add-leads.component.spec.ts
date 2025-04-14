import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLeadsComponent } from './add-leads.component';

describe('AddLeadsComponent', () => {
  let component: AddLeadsComponent;
  let fixture: ComponentFixture<AddLeadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddLeadsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddLeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
