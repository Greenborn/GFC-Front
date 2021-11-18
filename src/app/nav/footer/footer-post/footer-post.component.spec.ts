import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FooterPostComponent } from './footer-post.component';

describe('FooterPostComponent', () => {
  let component: FooterPostComponent;
  let fixture: ComponentFixture<FooterPostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FooterPostComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
