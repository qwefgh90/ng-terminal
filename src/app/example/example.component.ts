import { Component, OnInit } from '@angular/core';
import { Disposible } from '../ng-terminal/ng-terminal.component';

@Component({
    selector: 'app-example',
    templateUrl: './example.component.html',
    styleUrls: ['./example.component.css']
})
export class ExampleComponent implements OnInit {

    constructor() { }

    ngOnInit() {
    }


    onInit(disposible: Disposible) {
        disposible.println('https://github.com/qwefgh90/ng-terminal').println('Welcome to JShell!!').nextWithPrompt('jshell>');
    }

    onDefault(disposible: Disposible) {
        if (disposible.event.keyCode == 13)
            disposible.println('').print('[start] ').println(' you finished typing.').print('keep all').print(' keep all2').nextWithPrompt('jshell>');
        else
            disposible.next();
    }

}
