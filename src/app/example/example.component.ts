import { Component, OnInit } from '@angular/core';
import { TerminalBuffer, keyMap } from '../modules/ng-terminal/terminal-buffer';

@Component({
    selector: 'app-example',
    templateUrl: './example.component.html',
    styleUrls: ['./example.component.css']
})
export class ExampleComponent {

    constructor() { }

    public bf: TerminalBuffer;

    onInit(bf: TerminalBuffer) {
        this.bf = bf;
    }

    compositionCount = 0;

    onKey(e: KeyboardEvent) {
        //        console.log("event.type " + e.type + ":" + e.key);
        //        console.log(e);
        if (e.key == 'k' && e.ctrlKey) {
            this.bf.write(keyMap.FnEraseInLine(0));
        } else if (e.key == 'Enter') {
            this.bf.write(keyMap.Linefeed);
        } else if (e.key == 'Backspace') {
            this.bf.write(keyMap.BackSpace);
        } else if (e.key == 'ArrowLeft') {
            this.bf.write(keyMap.FnCursorCharacterAbsolute(this.bf.getRowCol().col - 1));
        } else if (e.key == 'ArrowRight') {
            this.bf.write(keyMap.ArrowRight);
        } else if (e.key == 'ArrowUp') {
            this.bf.write(keyMap.FnArrowUp(''));
        } else if (e.key == 'ArrowDown') {
            this.bf.write(keyMap.FnArrowDown(''));
        } else if (e.key == 'Delete') {
            this.bf.write(keyMap.Delete);
        } else if (e.key == 'Home') {
            this.bf.write(keyMap.KeyHome);
        } else if (e.key == 'End') {
            this.bf.write(keyMap.KeyEnd);
        } else if (e.key == 'Tab') {
            this.bf.write(keyMap.Tab);
        } else if (e.key == 'Insert') {
            this.bf.write(keyMap.Insert);
        } else if (e.type == 'compositionstart') {
            this.bf.write(' ');
            this.compositionCount = 1;
        } else if (e.type == 'compositionupdate') {
            if (this.bf.isInsertMode()) {
                this.bf.write('\b'.repeat(this.compositionCount));
                this.bf.write(e.key);
                this.compositionCount = e.key.length;
            } else {
                this.bf.write(keyMap.ArrowLeft.repeat(this.compositionCount));
                this.bf.write(e.key);
                this.compositionCount = e.key.length;
            }
        } else if (e.type == 'compositionend') {
            if (this.bf.isInsertMode()) {
                this.bf.write('\b'.repeat(this.compositionCount));
                this.bf.write(e.key);
                this.compositionCount = e.key.length;
            } else {
                this.bf.write(keyMap.ArrowLeft.repeat(this.compositionCount));
                this.bf.write(e.key);
                this.compositionCount = e.key.length;
            }
        } else
            if (e.key.length == 1)
                this.bf.write(e.key + '');
    }

    view = false;
    onViewButtonClick() {
        this.view = !this.view;
    }
}
