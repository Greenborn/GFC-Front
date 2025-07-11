import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JuecesComponent } from './jueces.component';

describe('JuecesComponent', () => {
  let component: JuecesComponent;
  let fixture: ComponentFixture<JuecesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JuecesComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(JuecesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
