import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ElementRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import { KindOfCharacterAttributes, NgTerminal } from 'ng-terminal';
import { FormControl } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Terminal } from '@xterm/xterm';
import { FunctionsUsingCSI } from 'ng-terminal';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { WebglAddon } from 'xterm-addon-webgl';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-root',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.css'],
})
export class ExampleComponent implements AfterViewInit {
  readonly title = 'NgTerminal Live Example';
  readonly color = 'accent';
  readonly prompt = '\n' + FunctionsUsingCSI.cursorColumn(1) + '$ ';

  _rows?: number = undefined;
  _cols?: number = undefined;
  _draggable: boolean = false;

  public draggableMode: boolean = false;
  public apiMode: boolean = false;

  disabled = false;
  rowsControl = new FormControl();
  colsControl = new FormControl();
  inputControl = new FormControl();

  underlying?: Terminal;
  writeSubject = new Subject<string>();
  keyInput: string = '';

  @ViewChild('term', { static: false }) child?: NgTerminal;
  @ViewChild('term2', { static: false }) child2?: NgTerminal;

  ngAfterViewInit() {
    this.initializeTerm2();
    if (!this.child) return;
    this.underlying = this.child.underlying!!;
    this.underlying.options.fontSize = 20;
    this.underlying.loadAddon(new WebLinksAddon());
    this.child.setXtermOptions({
      fontFamily: '"Cascadia Code", Menlo, monospace',
      theme: this.baseTheme,
      cursorBlink: true,
    });
    this.child.write(
      '$ NgTerminal Live Example\n' + FunctionsUsingCSI.cursorColumn(1)
    );
    this.child.write(
      FunctionsUsingCSI.characterAttributes(
        KindOfCharacterAttributes.SetforegroundcolortoRed,
        KindOfCharacterAttributes.Bold
      )
    );
    this.child.write(
      `$ 1) Try the data binding in the input below.\n` +
        FunctionsUsingCSI.cursorColumn(1)
    );
    this.child.write(
      FunctionsUsingCSI.characterAttributes(KindOfCharacterAttributes.Normal)
    );
    this.child.write(
      `$ 2) Try dragging on the ${FunctionsUsingCSI.characterAttributes(
        KindOfCharacterAttributes.SetbackgroundcolortoGreen
      )}borders\
${FunctionsUsingCSI.characterAttributes(
  KindOfCharacterAttributes.Normal
)} and set \
${FunctionsUsingCSI.characterAttributes(
  KindOfCharacterAttributes.SetbackgroundcolortoCyan
)}row and\
 col${FunctionsUsingCSI.characterAttributes(KindOfCharacterAttributes.Normal)}\
.\n` + FunctionsUsingCSI.cursorColumn(1)
    );
    this.child.write(
      FunctionsUsingCSI.characterAttributes(KindOfCharacterAttributes.Bold)
    );
    this.child.write(`$ `);
    this.child.onData().subscribe((input) => {
      if (!this.child) return;
      if (input === '\r') {
        // Carriage Return (When Enter is pressed)
        this.child.write(this.prompt);
      } else if (input === '\u007f') {
        // Delete (When Backspace is pressed)
        if (this.child.underlying!!.buffer.active.cursorX > 2)
          this.child.write('\b \b');
      } else if (input === '\u0003') {
        // End of Text (When Ctrl and C are pressed)
        this.child.write('^C');
        this.child.write(this.prompt);
      } else this.child.write(input);
    });

    this.child.onKey().subscribe((e) => {
      //onData() is commonly used.
    });
    this.rowsControl.valueChanges.subscribe(() => {
      this.updateRows();
    });
    this.colsControl.valueChanges.subscribe(() => {
      this.updateCols();
    });
  }

  resizableChange(event: MatSlideToggleChange) {
    this.draggableMode = event.checked;
    this.updateDraggable();
  }

  apiModeChange(event: MatSlideToggleChange) {
    this.apiMode = event.checked;
    this.updateDraggable();
  }

  updateDraggable() {
    if (this.apiMode) this.child!!.setDraggable(this.draggableMode);
    else this._draggable = this.draggableMode;
  }

  updateRows() {
    if (this.apiMode) this.child!!.setRows(this.rowsControl.value);
    else this._rows = this.rowsControl.value;
  }

  updateCols() {
    if (this.apiMode) this.child!!.setCols(this.colsControl.value);
    else this._cols = this.colsControl.value;
  }

  write() {
    this.writeSubject.next(eval(`'${this.inputControl.value}'`));
  }

  onKeyInput(event: string) {
    this.keyInput = event;
  }

  get displayOptionForLiveUpdate() {
    return {
      rows: this.rowsControl.value,
      cols: this.colsControl.value,
      draggable: this.draggableMode,
    };
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
    border: '#85858a',
  };

  showTerminal2 = true;

  toggleTerminal2() {
    this.showTerminal2 = !this.showTerminal2;
  }

  initializeTerm2() {
    if (!this.child2) return;
    let addon = new WebglAddon();
    addon.onContextLoss((e) => {
      addon.dispose();
    });
    this.child2?.underlying!!.loadAddon(addon);
    this.child2.setXtermOptions({
      fontFamily: '"Cascadia Code", Menlo, monospace',
      theme: this.baseTheme,
      cursorBlink: true,
    });
    this.child2.write(
      '$ NgTerminal2 Live Example\n' + FunctionsUsingCSI.cursorColumn(1)
    );
  }
}
