import { Subscription, Observable } from 'rxjs';
import { Terminal } from 'xterm';
import { DisplayOption } from './display-option';

export interface NgTerminal {
    /**
     * write charactors to terminal directly
     * @param chars charactors to write
     */
    write(chars: string)
    /**
     * getter only provided
     * observable connected to inputs which user typed on the div of terminal
     */
    keyInput: Observable<string>
    /**
     * getter only provided
     * return the core object of Terminal in xterm
     */
    underlying: Terminal
    /**
     * change row, col, draggable
     */
    setDisplayOption(opt: DisplayOption): void
}
