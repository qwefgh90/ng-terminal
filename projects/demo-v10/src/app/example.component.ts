import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import { NgTerminal, NgTerminalComponent } from 'ng-terminal';
import { FormControl } from '@angular/forms';
// import { DisplayOption } from 'ng-terminal';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Terminal } from 'xterm';
import { FunctionsUsingCSI } from 'ng-terminal';
import { WebLinksAddon } from 'xterm-addon-web-links';

@Component({
  selector: 'app-root',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.css']
})
export class ExampleComponent implements OnInit, AfterViewInit {
  readonly title = 'NgTerminal Live Example';
  readonly color = 'accent';
  readonly prompt = '\n' + FunctionsUsingCSI.cursorColumn(1) + '$ ';

  _rows: number = undefined;
  _cols: number = undefined;
  _draggable: boolean = undefined;
  
  public draggableMode: boolean;
  public apiMode: boolean;
  public fixed = false;

  disabled = false;
  rowsControl = new FormControl();
  colsControl = new FormControl();
  inputControl = new FormControl();

  underlying: Terminal;

  @ViewChild('term', {static: false}) child: NgTerminal;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.underlying = this.child.underlying;
    this.underlying.options.fontSize = 20;
    console.debug("example: font apply" );
    this.underlying.loadAddon(new WebLinksAddon());
    this.invalidate();
    this.child.setXtermOptions({
      fontFamily: '"Cascadia Code", Menlo, monospace',
      theme: this.baseTheme,
      cursorBlink: true
    });
    this.child.write('$ NgTerminal Live Example');
    this.child.write(this.prompt);
    this.child.onData().subscribe((input) => {
      if (input === '\r') { // Carriage Return (When Enter is pressed)
        this.child.write(this.prompt);
      } else if (input === '\u007f') { // Delete (When Backspace is pressed)
        if (this.child.underlying.buffer.active.cursorX > 2) {
          this.child.write('\b \b');
        }
      } else if (input === '\u0003') { // End of Text (When Ctrl and C are pressed)
          this.child.write('^C');
          this.child.write(this.prompt);
      }else
        this.child.write(input);
    })

    this.child.onKey().subscribe(e => {
      //onData() is used more often.
    });
    this.rowsControl.valueChanges.subscribe(() => { this.updateRows() });
    this.colsControl.valueChanges.subscribe(() => { this.updateCols() });
  }

  invalidate() {
  }

  resizableChange(event: MatSlideToggleChange) {
    this.draggableMode = event.checked;
    // if (this.draggableMode){
    //   // this.child.setStyle({"border": "4px solid #85858a"});
    //   this.fixed = false;
    // }
    this.updateDraggable();
  }

  apiModeChange(event: MatSlideToggleChange) {
    this.apiMode = event.checked;
  }

  updateDraggable(){
    if(this.apiMode)
      this.child.setDraggable(this.draggableMode);
    else
      this._draggable = this.draggableMode;
  }

  updateRows(){
    if(this.apiMode)
      this.child.setRows(this.rowsControl.value);
    else
      this._rows = this.rowsControl.value;
  }

  updateCols(){
    if(this.apiMode)
      this.child.setCols(this.colsControl.value);
    else
      this._cols = this.colsControl.value;
  }

  writeSubject = new Subject<string>();
  write() {
    this.writeSubject.next(eval(`'${this.inputControl.value}'`));
  }

  keyInput: string;
  onKeyInput(event: string) {
    this.keyInput = event;
  }
  
  get displayOptionForLiveUpdate() {
    return {rows: this.rowsControl.value, cols: this.colsControl.value, draggable: this.draggableMode};
  }
  
  baseTheme = {
    foreground: '#F8F8F8',
    background: '#2D2E2C',
    selectionBackground: '#5DA5D533',
    black: '#1E1E1D',
    brightBlack: '#262625',
    red: '#CE5C5C',
    brightRed: '#FF7272',
    green: '#5BCC5B',
    brightGreen: '#72FF72',
    yellow: '#CCCC5B',
    brightYellow: '#FFFF72',
    blue: '#5D5DD3',
    brightBlue: '#7279FF',
    magenta: '#BC5ED1',
    brightMagenta: '#E572FF',
    cyan: '#5DA5D5',
    brightCyan: '#72F0FF',
    white: '#F8F8F8',
    brightWhite: '#FFFFFF',
    border: '#85858a'
  };
}
