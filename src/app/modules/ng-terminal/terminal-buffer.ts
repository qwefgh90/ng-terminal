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
    constructor(private width: number = 80, private renderHtmlStrategy: (item: string) => { html: string, isContainingCharacter: boolean } = defaultRenderStrategy) {
        super();
        this.rightOrExtendRight(new ViewItem(' ', renderHtmlStrategy));
    }

    public setWidth(width: number) {
        if (width < 1)
            return
        else
            this.width = width;
    }

    public getLastColumn(row: number): number {
        let cRow = 1;
        let cColumn = 1;
        let lastColumn = -1;
        let ignoreList = [];
        this.buf.forEach((viewItem, index) => {
            let ch = viewItem.item
            if (cRow == row) {
                if (cColumn > lastColumn)
                    lastColumn = cColumn;
            }
            if (ch == "\n") {
                cRow++;
                cColumn = 1;
            } else if (cColumn == this.width) {
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
        })
        return lastColumn == -1 ? undefined : lastColumn;
    }

    public getIndex(row: number = undefined, column: number = undefined): number {
        if (row != undefined && column == undefined) {
            column = 1;
        } else if (row == undefined && column == undefined) {
            let rc = this.getRowCol();
            if (rc == undefined)
                return undefined;
            else {
                row = rc.row;
                column = rc.col;
            }
        }
        let cRow = 1;
        let cColumn = 1;
        let foundIndex = undefined;
        let ignoreList = [];
        this.buf.forEach((viewItem, index) => {
            let ch = viewItem.item
            if (cRow == row && cColumn == column)
                foundIndex = index;
            if (ch == "\n") {
                cRow++;
                cColumn = 1;
            } else if (cColumn == this.width) {
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
        })
        return foundIndex;
    }

    public getRowCol(targetIndex: number = this.index): { row: number, col: number } {
        let cRow = 1;
        let cColumn = 1;
        let foundRow = undefined;
        let foundCol = undefined;
        let ignoreList = [];
        this.buf.forEach((viewItem, index) => {
            let ch = viewItem.item
            if (targetIndex == index) {
                foundRow = cRow;
                foundCol = cColumn;
            }
            if (ch == "\n") {
                cRow++;
                cColumn = 1;
            } else if (cColumn == this.width) {
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
        })
        if (foundRow == undefined || foundCol == undefined)
            return undefined;
        else
            return { row: foundRow, col: foundCol };
    }

    protected insertMode = true;
    protected writeSubject = new Subject<string>();

    protected up() {
        while (this.index > 0) {
            this.index--;
            let item = this.current();
            if (item.item == '\n') {
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
        console.log('ch:' + ch);
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
        } else if (ch == keyMap.Return) {
            let rc = this.getRowCol()
            let index = this.getIndex(rc.row, 1)
            if (index != undefined)
                this.index = index;
        } else if (ch == keyMap.Insert) {
            this.toggleInsertKey();
        } else if (ch == keyMap.Delete) {
            if (this.right() && this.left())
                this.pullLeft();
        } else if (this.findTokenRegex(ch, keyMap.FnArrowUp, true) != null) {
            let m = this.findTokenRegex(ch, keyMap.FnArrowUp, true).matched;
            let defaultValue = 1
            let repeatCount = parseInt(m[1] != '' ? m[1] : defaultValue);
            console.log('FnArrowUp:' + repeatCount);
            while (repeatCount > 0) {
                let rc = this.getRowCol()
                let index = this.getIndex(rc.row - 1, rc.col)
                if (index == undefined)//fallback1
                    index = this.getIndex(rc.row - 1, this.getLastColumn(rc.row - 1))
                if (index == undefined)//fallback2
                    index = this.getIndex(rc.row, 1)
                if (index != undefined)
                    this.index = index;
                repeatCount--;
            }
        } else if (this.findTokenRegex(ch, keyMap.FnArrowDown, true) != null) {
            let m = this.findTokenRegex(ch, keyMap.FnArrowDown, true).matched;
            let defaultValue = 1;
            let repeatCount = parseInt(m[1] != '' ? m[1] : defaultValue);
            console.log('FnArrowDown:' + repeatCount);
            while (repeatCount > 0) {
                let rc = this.getRowCol()
                let index = this.getIndex(rc.row + 1, rc.col)
                if (index == undefined)//fallback1
                    index = this.getIndex(rc.row + 1, this.getLastColumn(rc.row + 1))
                if (index == undefined)//fallback2
                    index = this.getIndex(rc.row, this.getLastColumn(rc.row))
                if (index != undefined)
                    this.index = index;
                repeatCount--;
            }
        } else if (this.findTokenRegex(ch, keyMap.FnCursorCharacterAbsolute, true) != null) {
            let m = this.findTokenRegex(ch, keyMap.FnCursorCharacterAbsolute, true).matched;
            let defaultValue = 1
            let targetCol = parseInt(m[1] != '' ? m[1] : defaultValue);
            let rc = this.getRowCol()
            let index = this.getIndex(rc.row, targetCol);
            if (index == undefined && targetCol > this.getLastColumn(rc.row))
                index = this.getIndex(rc.row + 1, 1)
            else if (index == undefined && targetCol < 1) {
                index = this.getIndex(rc.row - 1, this.getLastColumn(rc.row - 1))
            }
            if (index != undefined)
                this.index = index;
            console.log('FnCursorCharacterAbsolute:' + JSON.stringify(this.getRowCol(this.index)));
        } else if (this.findTokenRegex(ch, keyMap.FnEraseInLine, true) != null) {
            let m = this.findTokenRegex(ch, keyMap.FnEraseInLine, true).matched;
            let defaultValue = 0;
            let selector = parseInt(m[1] != '' ? m[1] : defaultValue);
            console.log('FnEraseInLine:' + selector);
            let rc = this.getRowCol();
            let lastCol = this.getLastColumn(rc.row);
            let countToRight = lastCol - rc.col + 1;
            let countToLeft = rc.col - 1;
            if (selector == 0)
                this.write(keyMap.Delete.repeat(countToRight));
            else if (selector == 1)
                this.write(keyMap.BackSpace.repeat(countToLeft));
            else if (selector == 2)
                this.write(keyMap.BackSpace.repeat(countToLeft) + keyMap.Delete.repeat(countToRight));
        } else {
            if (ch.length != 0) {
                let first = ch[0];
                //ch.substr
                if (this.insertMode) {
                    this.pushRight(new ViewItem(' ', this.renderHtmlStrategy))
                    this.overwrite(new ViewItem(first, this.renderHtmlStrategy))
                    this.rightOrExtendRight(new ViewItem(' ', this.renderHtmlStrategy))
                } else { //overlay mode
                    this.overwrite(new ViewItem(first, this.renderHtmlStrategy))
                    this.rightOrExtendRight(new ViewItem(' ', this.renderHtmlStrategy))
                }
                this.handle(ch.substr(1))
            }
        }
    }

    private findTokenRegex(ch: string, func: Function, isFullMatch = false): { regExp: Function, matched: Array<any> } {
        let fullMatch = isFullMatch ? "$" : "";
        //        console.log('up: ' + new RegExp("^" + keyMap.FnArrowUp('([0-9]+)', true) + fullMatch));
        if (func == keyMap.FnArrowUp
            && ch.match(new RegExp("^" + keyMap.FnArrowUp('([0-9]*)', true) + fullMatch)) != null) {
            let matched = ch.match(new RegExp("^" + keyMap.FnArrowUp('([0-9]*)', true)));
            return { regExp: keyMap.FnArrowUp, matched: matched };
        }
        else if (func == keyMap.FnArrowDown
            && ch.match(new RegExp("^" + keyMap.FnArrowDown('([0-9]*)', true) + fullMatch)) != null) {
            let matched = ch.match(new RegExp("^" + keyMap.FnArrowDown('([0-9]*)', true)));
            return { regExp: keyMap.FnArrowDown, matched: matched };
        }
        else if (func == keyMap.FnCursorCharacterAbsolute
            && ch.match(new RegExp("^" + keyMap.FnCursorCharacterAbsolute('([0-9]*)', true) + fullMatch)) != null) {
            let matched = ch.match(new RegExp("^" + keyMap.FnCursorCharacterAbsolute('([0-9]*)', true)));
            return { regExp: keyMap.FnCursorCharacterAbsolute, matched: matched };
        }
        else if (func == keyMap.FnEraseInLine
            && ch.match(new RegExp("^" + keyMap.FnEraseInLine('([0-2]?)', true) + fullMatch)) != null) {
            let matched = ch.match(new RegExp("^" + keyMap.FnEraseInLine('([0-2]?)', true)));
            return { regExp: keyMap.FnEraseInLine, matched: matched };
        }
        return null;
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
                        return this.findTokenRegex(fullText, keyMap[v]) != null;
                })
                .map((v: string, i, arr) => {
                    if (typeof keyMap[v] === "string")
                        return keyMap[v];
                    else if (typeof keyMap[v] === "function")
                        return this.findTokenRegex(fullText, keyMap[v]).matched[0];
                }).reduce((acc, c, i, arr) => {
                    if (acc != undefined && (acc.length > c.length))
                        return acc;
                    else
                        return c;
                }, undefined);
            if (foundKey == undefined)
                return fullText;
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
