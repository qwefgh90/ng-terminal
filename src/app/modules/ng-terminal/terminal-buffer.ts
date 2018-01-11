import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

export class Buffer<T> {
    public buf: Array<T> = new Array<T>();//only allowed to modify data with low level API
    public index: number = -1;//cursor offset

    /*
     * low level API
     * [a,b,c,d]+[?] range in (buffer + 1)
     */
    //cursor move left in leftmost boundary
    protected left(): boolean {
        if (this.index > 0) {
            this.index--;
            return true;
        } else
            return false;
    }
    //cursor move right in rightmost boundary
    protected right(): boolean {
        if (this.index < this.buf.length - 1) {
            this.index++;
            return true;
        } else
            return false;
    }
    //overwrite current position
    protected overwrite(e: T): boolean {
        if (this.index != -1) {
            this.buf[this.index] = e;
            return true;
        } else
            return false;
    }
    //extend buffer
    protected extend(e: T) {
        this.buf.push(e)
    }
    //reduce count
    protected reduce(count: number) {
        this.buf.splice(this.buf.length - count, count)
    }
    //pull elements to left from current cursor + 1
    protected pullLeft(size: number = 1) {
        for (let i = this.index + 1; i < this.buf.length; i++) {
            if ((i - size) >= 0)
                this.buf[i - size] = this.buf[i];
        }
        this.reduce(size)
    }
    //pull elements to right from current cursor
    protected pushRight(defaultValue: T, size: number = 1) {
        this.extend(defaultValue);
        for (let i = (this.buf.length - 1); i >= this.index; i--) {
            if ((i + size) < this.buf.length) {
                this.buf[i + size] = this.buf[i];
                this.buf[i] = defaultValue;
            }
        }
    }
    //move cursor right, if the cursor is not at a last position. Otherwise, extend buffer and move cursor right.
    protected rightOrExtendRight(e: T) {
        if (!this.right()) {
            this.extend(e)
            this.right()
        }
    }

    protected current(): T {
        return this.buf[this.index];
    }
}

export class ViewItem {
    constructor(item: string, renderHtmlStrategy: (item: string) => { html: string, isContainingCharacter: boolean }) {
        this.item = item;
        let result = renderHtmlStrategy(this.item);
        this.html = result.html;
        this.isContainingCharacter = result.isContainingCharacter;
    }
    public item: string;
    public html: string;
    public isContainingCharacter: boolean;
}

export function defaultRenderStrategy(item: string): { html: string, isContainingCharacter: boolean } {
    let html;
    let isContaingCharacter = true;
    if (item == ' ') {
        html = '&nbsp;'
    } else if (item == keyMap.Linefeed) {
        html = '<br/>';
        isContaingCharacter = false;
    } else if (item == keyMap.Tab) {
        html = '&nbsp;&nbsp;&nbsp;&nbsp;';
    } else {
        html = item;
    }
    return { 'html': html, 'isContainingCharacter': isContaingCharacter };
}

export let keyMap = {
    //Common Keys
    ArrowDown: '\u001b[B',//
    ArrowLeft: '\u001b[D',//
    ArrowRight: '\u001b[C',//
    ArrowUp: '\u001b[A',//
    BackSpace: '\u0008',//
    BackTab: '\u001bOP\u0009',
    Delete: '\u007f',//
    Escape: '\u001b',
    Linefeed: '\u000a',//
    Return: '\u000d',
    Tab: '\u0009',//
    //Other Keys
    Do: '\u001b[29~',
    Find: '\u001b[1~',
    Help: '\u001b[28~',
    Insert: '\u001b[2~',
    KeyEnd: '\u001b[F',//
    KeyHome: '\u001b[H',//
    NextScn: '\u001b[6~',
    PrevScn: '\u001b[5~',
    Remove: '\u001b[3~',
    Select: '\u001b[44~',
    /*
     * ANSI Escape sequences 
     * https://en.wikipedia.org/wiki/ANSI_escape_code
     * http://invisible-island.net/xterm/ctlseqs/ctlseqs.html
     */
    FnCursorCharacterAbsolute: <T>(column: T, isRegexp = false) =>
        unescapeUnicode('\\u001b\\u005b', isRegexp) + (column != undefined ? column : '') + 'G',
    FnArrowUp: <T>(i: T, isRegexp = false) =>
        unescapeUnicode('\\u001b\\u005b', isRegexp) + (i != undefined ? i : '') + 'A', //1
    FnArrowDown: <T>(i: T, isRegexp = false) =>
        unescapeUnicode('\\u001b\\u005b', isRegexp) + (i != undefined ? i : '') + 'B', //1
    FnEraseInLine: <T>(i: T, isRegexp = false) =>
        unescapeUnicode('\\u001b\\u005b', isRegexp) + (i != undefined ? i : '') + 'K', //0
}


function unescapeUnicode(str: string, isRegexp: boolean) {
    if (isRegexp)
        return str;
    else
        return str.replace(/\\u([a-fA-F0-9]{4})/g, function(g, m1) {
            return String.fromCharCode(parseInt(m1, 16));
        });
}

/*
 *  This follows telnet keys with ascii.
 *  https://www.novell.com/documentation/extend5/Docs/help/Composer/books/TelnetAppendixB.html
 */
export class TerminalBuffer extends Buffer<ViewItem> {
    constructor(private renderHtmlStrategy: (item: string) => { html: string, isContainingCharacter: boolean } = defaultRenderStrategy) {
        super();
        this.rightOrExtendRight(new ViewItem(' ', renderHtmlStrategy));
    }

    //public selectedRow: number = -1;
    //public selectedColumn: number = -1;
    //public lastRow: number = -1;
    //public lastColumn: number = -1;

    public getIndex(row: number, column: number): number {
        let cRow = 1;
        let cColumn = 1;
        let resultIndex = undefined;
        let ignoreList = [];
        this.buf.forEach((viewItem, index) => {
            let ch = viewItem.item
            if (ch == "\n") {
                cRow++;
                cColumn = 1;
            } else if (cColumn == 80) {
                cRow++;
                cColumn = 1;
            } else if (ignoreList.find((v, i) => {
                if (v == ch)
                    return true;
                else
                    return false;
            })) {
            } else
                cColumn++;
            // add some codes
        })

        return undefined;
    }

    public getRowCol(index: number): { row: number, col: number } {
        return undefined;
    }

    protected insertMode = true;
    protected writeSubject = new Subject<string>();

    protected up() {
        while (this.index > 0) {
            this.index--;
            let item = this.current();
            if (item.item == '\n') {
                //                    this.index++;
                break;
            }
        }
    }

    protected down() {
        while (this.index < this.buf.length - 1) {
            let item = this.current();
            if (item.item == '\n') {
                if (this.index != this.buf.length - 1)
                    this.index++;
                break;
            }
            this.index++;
        }
    }

    protected home() {
        this.up();
        if (this.index != 0)
            this.down();
    }

    protected end() {
        this.down();
        if (this.index != this.buf.length - 1)
            this.up();
    }

    protected toggleInsertKey() {
        this.insertMode = !this.insertMode;
    }

    public isInsertMode(): boolean {
        return this.insertMode;
    }

    //This follows telnet keys with ascii. https://www.novell.com/documentation/extend5/Docs/help/Composer/books/TelnetAppendixB.html
    protected handle(ch: string) {
        if (ch == keyMap.BackSpace) {
            if (this.left())
                this.pullLeft();
        } else if (ch == keyMap.ArrowRight) {
            this.right();
        } else if (ch == keyMap.ArrowLeft) {
            this.left();
        } else if (ch == keyMap.ArrowUp) {
            this.up();
        } else if (ch == keyMap.ArrowDown) {
            this.down();
        } else if (ch == keyMap.KeyHome) {
            this.home();
        } else if (ch == keyMap.KeyEnd) {
            this.end();
        } else if (ch == keyMap.Insert) {
            this.toggleInsertKey();
        } else if (ch == keyMap.Delete) {
            if (this.right() && this.left())
                this.pullLeft();
        } else if (ch.match(new RegExp("^" + keyMap.FnArrowUp('([0-9]+)', true) + "$")) != null) {
            this.up();
        } else if (ch.match(new RegExp("^" + keyMap.FnCursorCharacterAbsolute('([0-9]+)', true) + "$")) != null) {

            //            this.up();
        } else if (ch.match(new RegExp("^" + keyMap.FnEraseInLine('([0-3])', true) + "$")) != null) {

            //            this.up();
        } else {
            if (ch.length == 1) {
                if (this.insertMode) {
                    this.pushRight(new ViewItem(' ', this.renderHtmlStrategy))
                    this.overwrite(new ViewItem(ch, this.renderHtmlStrategy))
                    this.rightOrExtendRight(new ViewItem(' ', this.renderHtmlStrategy))
                } else { //overlay mode
                    this.overwrite(new ViewItem(ch, this.renderHtmlStrategy))
                    this.rightOrExtendRight(new ViewItem(' ', this.renderHtmlStrategy))
                }
            }
        }
    }

    protected tokenize(fullText: string): Array<string> {
        let getToken: (fullText: string) => string = (fullText: string) => {
            if (fullText.length == 0)
                return undefined;
            var keys = Object.keys(keyMap);
            let foundKey = keys
                .filter((v, i, arr) => {
                    if (typeof keyMap[v] === "string")
                        return fullText.startsWith(keyMap[v]);
                    else if (typeof keyMap[v] === "function")
                        return fullText.match(new RegExp("^" + keyMap[v]("[0-9]+", true))) != null;
                })
                .map((v: string, i, arr) => {
                    if (typeof keyMap[v] === "string")
                        return keyMap[v];
                    else if (typeof keyMap[v] === "function")
                        return fullText.match(new RegExp("^" + keyMap[v]("[0-9]+", true)))[0];
                }).reduce((acc, c, i, arr) => {
                    if (acc != undefined && (acc.length > c.length))
                        return acc;
                    else
                        return c;
                }, undefined);
            if (foundKey == undefined)
                return fullText.charAt(0);
            else
                return foundKey;

        }
        let result: Array<string> = [];
        while (true) {
            let token = getToken(fullText);
            if (token != undefined) {
                result.push(token);
                fullText = fullText.substring(token.length);
            } else
                break;
        }
        return result;
    }

    public setRenderHtmlStrategy(strategy: (item: string) => { html: string, isContainingCharacter: boolean }): void {
        this.renderHtmlStrategy = strategy;
        this.buf = this.buf.map((v, i, arr) => {
            return new ViewItem(v.item, this.renderHtmlStrategy);
        })
    }

    public write(e: string): TerminalBuffer {
        this.tokenize(e).forEach((v, i, arr) => this.handle(v))
        this.writeSubject.next(e);
        return this;
    }

    public getWriteObservable(): Observable<string> {
        return this.writeSubject;
    }
}
