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
        disposible.println('https://github.com/qwefgh90/ng-terminal').println('Welcome to NgTerminal!!').prompt('ng>');
    }

    onDefault(disposible: Disposible) {
        if (disposible.event.key == 'Enter') {
            let newDisposible = disposible.println('').println('something is on progress...')
            setTimeout(() => { newDisposible.println('').print('').print('complete!').prompt('ng>'); }, 2000);
        } else
            disposible.handle();
    }

}
