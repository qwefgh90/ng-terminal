import { Component, OnInit, AfterViewChecked, ViewEncapsulation } from '@angular/core';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';

@Component({
  selector: 'ng-terminal',
  templateUrl: './ng-terminal.component.html',
  styleUrls: ['./ng-terminal.component.css']
})
export class NgTerminalComponent implements OnInit, AfterViewChecked {
  term: Terminal;

  constructor() { }

  /**
   * When a dimension of div changes, fit a terminal in div.
   */
  ngAfterViewChecked() {
    fit.fit(this.term);
  }

  /**
   * It creates new terminal in #terminal.
   */
  ngOnInit() {
    Terminal.applyAddon(fit);  // Apply the `fit` addon   
    this.term = new Terminal();
    this.term.open(document.getElementById('terminal'));
    this.term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $  ')
  }

}
