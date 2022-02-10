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
  title = 'NgTerminal Live Example';
  color = 'accent';

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
    this.child.write('$ ');
    this.child.keyInput.subscribe((input) => {
      //do nothing because it will be replaced keyEventInput
    })

    this.child.keyEventInput.subscribe(e => {
      console.log('keyboard event:' + e.domEvent.keyCode + ', ' + e.key);

      const ev = e.domEvent;
      const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

      if (ev.keyCode === 13) {
        this.child.write('\n' + FunctionsUsingCSI.cursorColumn(1) + '$ '); // \r\n
      } else if (ev.keyCode === 8) {
        // Do not delete the prompt
        if (this.child.underlying.buffer.active.cursorX > 2) {
          this.child.write('\b \b');
        }
      } else if (printable) {
        this.child.write(e.key);
      }
    })
    this.rowsControl.valueChanges.subscribe(() => { this.updateRows() });
    this.colsControl.valueChanges.subscribe(() => { this.updateCols() });
  }

  invalidate() {
    // if (this.resizable)
    //   this.displayOption.activateDraggableOnEdge = { minWidth: 100, minHeight: 100 };
    // else
    //   this.displayOption.activateDraggableOnEdge = undefined;
    // if (this.fixed)
    //   this.displayOption.fixedGrid = { rows: this.rowsControl.value, cols: this.colsControl.value };
    // else
    //   this.displayOption.fixedGrid = undefined;
    // this.child.setDisplayOption(this.displayOption);
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

  // fixedChange(event: MatSlideToggleChange) {
  //   this.fixed = event.checked;
  //   if (this.fixed){
  //     // this.child.setStyle({"border": "unset"});
  //     this.draggableMode = false;
  //   }
  //   this.updateDraggable();
  // }

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
}
