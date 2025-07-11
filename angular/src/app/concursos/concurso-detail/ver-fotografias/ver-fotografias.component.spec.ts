import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VerFotografiasComponent } from './ver-fotografias.component';

describe('VerFotografiasComponent', () => {
  let component: VerFotografiasComponent;
  let fixture: ComponentFixture<VerFotografiasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerFotografiasComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VerFotografiasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
