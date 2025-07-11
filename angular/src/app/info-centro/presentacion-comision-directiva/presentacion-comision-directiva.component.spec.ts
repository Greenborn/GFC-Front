import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PresentacionComisionDirectivaComponent } from './presentacion-comision-directiva.component';

describe('PresentacionComisionDirectivaComponent', () => {
  let component: PresentacionComisionDirectivaComponent;
  let fixture: ComponentFixture<PresentacionComisionDirectivaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PresentacionComisionDirectivaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PresentacionComisionDirectivaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
