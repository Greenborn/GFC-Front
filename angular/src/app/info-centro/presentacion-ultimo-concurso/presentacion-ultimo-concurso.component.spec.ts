import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PresentacionUltimoConcursoComponent } from './presentacion-ultimo-concurso.component';

describe('PresentacionUltimoConcursoComponent', () => {
  let component: PresentacionUltimoConcursoComponent;
  let fixture: ComponentFixture<PresentacionUltimoConcursoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PresentacionUltimoConcursoComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PresentacionUltimoConcursoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
