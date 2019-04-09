import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'global-style',
  templateUrl: './global-style.component.html',
  styleUrls: ['./xterm.css'],  //global styles
  encapsulation: ViewEncapsulation.None
})
export class GlobalStyleComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
