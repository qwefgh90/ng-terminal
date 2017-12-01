import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { NgTerminalModule } from './modules/ng-terminal/ng-terminal.module';
import { ExampleComponent } from './example/example.component';

@NgModule({
    declarations: [
        AppComponent,
        ExampleComponent
    ],
    imports: [
        NgTerminalModule,
        BrowserModule,
        BrowserAnimationsModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {

}
