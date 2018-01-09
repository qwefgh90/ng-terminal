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
        if (e.key == 'Enter') {
            this.bf.write(keyMap.Linefeed);
        } else if (e.key == 'Backspace') {
            this.bf.write(keyMap.BackSpace);
        } else if (e.key == 'ArrowLeft') {
            this.bf.write(keyMap.ArrowLeft);
        } else if (e.key == 'ArrowRight') {
            this.bf.write(keyMap.ArrowRight);
        } else if (e.key == 'ArrowUp') {
            this.bf.write(keyMap.ArrowUp);
        } else if (e.key == 'ArrowDown') {
            this.bf.write(keyMap.ArrowDown);
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
        } else
            if (e.key.length == 1)
                this.bf.write(e.key);
    }
}
