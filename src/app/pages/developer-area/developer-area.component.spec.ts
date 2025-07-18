import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeveloperAreaComponent } from './developer-area.component';

describe('DeveloperAreaComponent', () => {
  let component: DeveloperAreaComponent;
  let fixture: ComponentFixture<DeveloperAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeveloperAreaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeveloperAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
