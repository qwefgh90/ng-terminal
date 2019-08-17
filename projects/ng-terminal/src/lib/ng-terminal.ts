import { Subscription, Observable } from 'rxjs';
import { Terminal } from 'xterm';
import { DisplayOption } from './display-option';

export interface NgTerminal {
    /**
     * write print charactors or control sequences to the xterm directly
     * @param chars charactors to write
     */
    write(chars: string)
    /**
     * getter only provided
     * observable connected to inputs which user typed on the div for the xterm
     */
    readonly keyInput: Observable<string>
    /**
     * getter only provided
     * return the core object of the terminal where you can control everything directly
     */
    readonly underlying: Terminal
    /**
     * change row, col, draggable
     */
    setDisplayOption(opt: DisplayOption): void
}
