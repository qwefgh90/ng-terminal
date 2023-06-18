import { Observable } from 'rxjs';
import { ITerminalOptions, Terminal } from 'xterm';

interface TerminalWrapper{
    /**
     * An wrapper of write() in the Xterm Terminal
     * write printable charactors or control sequences to the xterm directly
     * @param chars charactors to write
     */
    write(chars: string): void
    /**
     * @deprecated
     * It is an alias of onData() that is recommended instead of using it.
     * A observable to emit printable characters when a user typed on the div for the xterm
     */
    readonly keyInput: Observable<string>
    /**
     * @deprecated
     * It is an alias of onKey() that is recommended instead of using it.
     * A observable to emit keys and keyboard event when a user typed on the div for the xterm
     */
    readonly keyEventInput: Observable<{key: string; domEvent: KeyboardEvent;}>
    /**
     * An wrapper of onData() in the Xterm Terminal
     * A observable to emit printable characters which is encoded using UTF-8 when a user typed on the terminal
     */
    onData(): Observable<string>
    /**
     * An wrapper of onKey() in the Xterm Terminal
     * A observable to emit keys and keyboard event when a user typed on the terminal
     */
    onKey(): Observable<{key: string; domEvent: KeyboardEvent;}>
    /**
     * An wrapper of the property options of the Xterm Terminal
     * ITerminalOptions is defined in [Xterm.js](https://github.com/xtermjs/xterm.js/blob/4.14.1/typings/xterm.d.ts#L31).
     * @param options ITerminalOptions or theme.border which is a color of borders.
     */
    setXtermOptions(options: ITerminalOptions | {theme?: {border?: string}}): void;
    /**
     * The instnace of the Xterm Terminal.
     */
    readonly underlying: Terminal | undefined
}

export interface NgTerminal extends TerminalWrapper{
    /**
     * Toggle draggable.
     */
    setDraggable(draggable: boolean): void;
    /**
     * Change the row count of a terminal immediately.
     * @param rows 
     */
    setRows(rows: number): void;
    /**
     * Change the column count of a terminal immediately.
     * @param cols 
     */
    setCols(cols: number): void;
    /**
     * Set the minimum height to limit dragging.
     * @param height 
     */
    setMinHeight(height: number): void;
    /**
     * Set the minimum width to limit dragging.
     * @param width 
     */
    setMinWidth(width: number): void;
    /**
     * Apply styles into an element that has .resize-box class.
     * @param styleObject 
     */
    setStyle(styleObject: any): void;
}
