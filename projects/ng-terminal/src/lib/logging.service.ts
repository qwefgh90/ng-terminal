import { Injectable, Optional } from '@angular/core';
import { ModuleOptions } from './module-options';

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  private enableLog: boolean = false;
  constructor(@Optional() _options?: ModuleOptions) {
    if (_options) this.enableLog = _options.enableLog;
  }

  log(loggingFunc: () => void) {
    if (this.enableLog) loggingFunc();
  }
}
