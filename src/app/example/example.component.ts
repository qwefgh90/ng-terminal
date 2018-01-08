import { Component, OnInit } from '@angular/core';
import { TerminalBuffer } from '../modules/ng-terminal/terminal-buffer';

@Component({
    selector: 'app-example',
    templateUrl: './example.component.html',
    styleUrls: ['./example.component.css']
})
export class ExampleComponent implements OnInit {

    constructor() { }

    ngOnInit() {
    }

    public bf: TerminalBuffer;

    onInit(bf: TerminalBuffer) {
        this.bf = bf;
    }

    onKey(e: KeyboardEvent) {
        if (e.key == 'Enter') {
            this.bf.write('\n');
        } else if (e.key == 'Backspace') {
            this.bf.write('\b \b');
        } else if (e.key == 'ArrowLeft') {
            this.bf.write('\b');
        } else if (e.key == 'ArrowRight') {
            this.bf.right();
        } else if (e.key.length == 1) {
            this.bf.write(e.key);
        }
    }
    /*
        onInit(disposible: Disposable) {
            disposible.println('https://github.com/qwefgh90/ng-terminal').println('Welcome to NgTerminal!!').prompt('ng>');
        }
    
        onNext(disposible: Disposable) {
            if (disposible.event.key == 'Enter') {
                let newDisposible = disposible.println('').println('something is in progress...')
                setTimeout(() => { newDisposible.println('').print('').print('complete!').prompt('ng>'); }, 2000);
            } else
                disposible.handle();
        }
    */
}
