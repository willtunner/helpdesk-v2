import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemVersionComponent } from './system-version.component';

describe('SystemVersionComponent', () => {
  let component: SystemVersionComponent;
  let fixture: ComponentFixture<SystemVersionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemVersionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
