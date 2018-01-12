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

    onKey(e: KeyboardEvent) {
        //console.log("event.type " + e.type + ":" + e.key);
        if (e.key == 'Enter') {
            this.bf.write(keyMap.Linefeed);
        } else if (e.key == 'Backspace') {
            this.bf.write(keyMap.BackSpace);
        } else if (e.key == 'ArrowLeft') {
            this.bf.write(keyMap.FnCursorCharacterAbsolute(this.bf.getRowCol().col - 1));
        } else if (e.key == 'ArrowRight') {
            this.bf.write(keyMap.FnCursorCharacterAbsolute(this.bf.getRowCol().col + 1));
        } else if (e.key == 'ArrowUp') {
            this.bf.write(keyMap.ArrowUp);
        } else if (e.key == 'ArrowDown') {
            this.bf.write(keyMap.ArrowDown);
        } else if (e.key == 'Delete') {
            this.bf.write(keyMap.FnEraseInLine(undefined));
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
        } else if (e.type == 'compositionupdate' && e.key.length == 1) {
            if (this.bf.isInsertMode()) {
                this.bf.write('\b');
                this.bf.write(e.key);
            } else {
                this.bf.write(keyMap.ArrowLeft);
                this.bf.write(e.key);
            }
        } else if (e.type == 'compositionend' && e.key.length == 1) {
            if (e.key < '\u007f') { //ignore writing low unicode key in mobile. It should be written in textInput event
                if (this.bf.isInsertMode())
                    this.bf.write('\b');
                else
                    this.bf.write(keyMap.ArrowLeft);
            } else if (this.bf.isInsertMode()) {
                this.bf.write('\b');
                this.bf.write(e.key);
            } else {
                this.bf.write(keyMap.ArrowLeft);
                this.bf.write(e.key);
            }
        } else
            if (e.key.length == 1)
                this.bf.write(e.key + '');
        //        console.log('index -> ' + this.bf.index);
        //        let rc = this.bf.getRowCol()
        //        console.log(this.bf.getRowCol());
        //        console.log('found index -> ' + this.bf.getIndex());
    }

    view = false;
    onViewButtonClick() {
        this.view = !this.view;
    }
}
