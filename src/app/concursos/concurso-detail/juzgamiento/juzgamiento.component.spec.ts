import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JuzgamientoComponent } from './juzgamiento.component';

describe('JuzgamientoComponent', () => {
  let component: JuzgamientoComponent;
  let fixture: ComponentFixture<JuzgamientoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JuzgamientoComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(JuzgamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
