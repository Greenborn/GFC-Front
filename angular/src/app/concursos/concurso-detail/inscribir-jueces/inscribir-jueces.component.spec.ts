import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InscribirJuecesComponent } from './inscribir-jueces.component';

describe('InscribirJuecesComponent', () => {
  let component: InscribirJuecesComponent;
  let fixture: ComponentFixture<InscribirJuecesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InscribirJuecesComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InscribirJuecesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
