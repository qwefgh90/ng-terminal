import { Subscription, Observable } from 'rxjs';
import { Terminal } from 'xterm';
import { DisplayOption } from './display-option';

export interface NgTerminalApi {
    /**
     * write charactors to terminal directly
     * @param chars charactors to write
     */
    write(chars: string)
    /**
     * observable connected to inputs which user typed on the terminal
     */
    userInput(): Observable<string>
    /**
     * return the core object of Terminal in xterm
     */
    underlying(): Terminal
    /**
     * change row, col, draggable
     */
    setDisplayOption(opt: DisplayOption): void

}
