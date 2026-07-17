import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Section } from 'src/app/models/section.model';
import { SectionService } from 'src/app/services/section.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { AlertService } from 'src/app/services/ui/alert.service';
import { BtnPostComponent } from 'src/app/shared/btn-post/btn-post.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, BtnPostComponent],
  selector: 'app-seccion-post',
  templateUrl: './seccion-post.component.html',
  styleUrls: ['./seccion-post.component.scss'],
})
export class SeccionPostComponent extends ApiConsumer implements OnInit {

  @Input() modalController: any;
  @Input() parentSections: Section[]
  @Input() section: Section

  public posting: boolean = false;

  constructor(
    alertService: AlertService,
    public responsiveService: ResponsiveService,
    private sectionService: SectionService,
    private UIUtilsService: UiUtilsService
  ) { 
    super(alertService)
    this.section = this.sectionService.template
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
    if (f.valid) {
      let model = f.value;
      // if (model.parent_id == undefined) {
      //   model.parent_id = null
      // }
      // model.parent_id = this.typeSubsection ? this.section.parent_id : null
      console.log('posting', model)
      this.posting = true
      super.fetch<Section>(() => this.sectionService.post(model, this.section.id)).subscribe(
        async section => {
          this.posting = false
          try { await this.modalController.dismiss({ section }); } catch {}
        },
        err => {
          console.log('error post seccion', err)
          this.posting = false
          this.UIUtilsService.mostrarError({ message: this.errorFilter(err.statusText) })
        }
      )
      // console.log('posting', model, this.section.id)

    }
  }

}
