import { ModuleWithProviders, NgModule } from '@angular/core';
import { NgTerminalComponent } from './ng-terminal.component';
import { ResizableModule } from 'angular-resizable-element';
import { GlobalStyleComponent } from './global-style/global-style.component';
import { CommonModule } from '@angular/common';
import { ModuleOptions } from './module-options';

@NgModule({
  declarations: [NgTerminalComponent, GlobalStyleComponent],
  imports: [ResizableModule, CommonModule],
  exports: [NgTerminalComponent],
})
export class NgTerminalModule {
  static forRoot(
    config?: ModuleOptions
  ): ModuleWithProviders<NgTerminalModule> {
  return {
    ngModule: NgTerminalModule,
    providers: [
      {provide: ModuleOptions, useValue: config }
    ]
  };
  }
}