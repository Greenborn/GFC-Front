import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Section } from 'src/app/models/section.model';
import { SectionService } from 'src/app/services/section.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';

@Component({
  selector: 'app-seccion-post',
  templateUrl: './seccion-post.component.html',
  styleUrls: ['./seccion-post.component.scss'],
})
export class SeccionPostComponent extends ApiConsumer implements OnInit {

  @Input() modalController: ModalController;
  @Input() parentSections: Section[]
  @Input() section: Section = this.sectionService.template
  // @Input() typeSubsection: boolean;

  public posting: boolean = false;
  public cont: number = 0;

  constructor(
    alertCtrl: AlertController,
    public responsiveService: ResponsiveService,
    private sectionService: SectionService,
    private UIUtilsService: UiUtilsService
  ) { 
    super(alertCtrl)
  }

  get formTitle(): string {
    return (this.section.id != undefined ? 'Editar' : 'Agregar') + ' sección'
      // ((this.typeSubsection) ? ' subsección' : ` seccion`)
  }

  ngOnInit() {
    // this.typeSubsection = this.section.parent_id != null
  }

  datosCargados(form: NgForm): boolean {
    return form.valid
  }

  postSection(f: NgForm) {
    if (this.cont < 1) {
      this.cont++
    if (f.valid) {
      let model = f.value;
      // if (model.parent_id == undefined) {
      //   model.parent_id = null
      // }
      // model.parent_id = this.typeSubsection ? this.section.parent_id : null
      console.log('posting', model)
      this.posting = true
      super.fetch<Section>(() => this.sectionService.post(model, this.section.id)).subscribe(
        section => {
          this.posting = false
          this.modalController.dismiss({ section })
        },
        err => {
          console.log('error post seccion', err)
          this.posting = false
          this.UIUtilsService.mostrarError({ message: err.statusText })
        }
      )
      // console.log('posting', model, this.section.id)

    }
  }
  }

}
