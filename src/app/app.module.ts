import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { NgTerminalComponent } from './ng-terminal/ng-terminal.component';

const appRoutes: Routes = [
    {path: '', component: NgTerminalComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    NgTerminalComponent
  ],
  imports: [
      BrowserModule,
      BrowserAnimationsModule,
      RouterModule.forRoot(
          appRoutes,
          { enableTracing: true } // <-- debugging purposes only
      )
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { 

}
