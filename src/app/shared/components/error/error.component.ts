import {Component, ElementRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';
import {NgIf} from '@angular/common';
import {BaseComponent} from '../base/base.component';

@Component({
  selector: 'app-error',
  standalone: true,
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
  imports: [
    NgIf
  ],
  animations: [
    trigger('errorAnimation', [
      // Enter animation when the element is added
      transition(':enter', [
        style({height: '0', opacity: 0, overflow: 'hidden'}),
        animate('300ms ease-out', style({height: '*', opacity: 1}))
      ]),
      // Exit animation when the element is removed
      transition(':leave', [
        style({overflow: 'hidden'}),
        animate('300ms ease-out', style({height: '0', opacity: 0}))
      ]),
      // Animation when content changes (content resizing)
      transition('* <=> *', [
        style({overflow: 'hidden', height: '{{startHeight}}px'}),
        animate('300ms ease-out', style({height: '*'}))
      ], {params: {startHeight: 0}})
    ])
  ]
})
export class ErrorComponent extends BaseComponent implements OnChanges {
  @Input() errorMsg: string | null = '';
  animationParams = {startHeight: 0};

  constructor(private el: ElementRef) {
    super();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['errorMsg']) {
      this.animationParams.startHeight = this.el.nativeElement.offsetHeight;
    }
  }
}
