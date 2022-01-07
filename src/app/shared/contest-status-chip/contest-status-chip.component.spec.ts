import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ContestStatusChipComponent } from './contest-status-chip.component';

describe('ContestStatusChipComponent', () => {
  let component: ContestStatusChipComponent;
  let fixture: ComponentFixture<ContestStatusChipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContestStatusChipComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ContestStatusChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
