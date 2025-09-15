import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOperatorDialogComponent } from './add-operator-dialog.component';

describe('AddOperatorDialogComponent', () => {
  let component: AddOperatorDialogComponent;
  let fixture: ComponentFixture<AddOperatorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOperatorDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOperatorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
