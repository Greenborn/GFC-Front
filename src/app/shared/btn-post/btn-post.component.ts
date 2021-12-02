import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-btn-post',
  templateUrl: './btn-post.component.html',
  styleUrls: ['./btn-post.component.scss'],
})
export class BtnPostComponent implements OnInit {

  @Input() disabled: boolean;
  @Input() posting: boolean;
  @Output() post = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {}

}
