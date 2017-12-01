import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgTerminalComponent } from './ng-terminal.component'

@NgModule({
    imports: [
        CommonModule,
        BrowserAnimationsModule
    ],
    declarations: [NgTerminalComponent],
    exports: [NgTerminalComponent]
})
export class NgTerminalModule { }
