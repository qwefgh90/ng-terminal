import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Buffer } from './buffer'
import { $ } from 'protractor';

export class ViewItem {
    constructor(readonly item: string, readonly renderHtmlStrategy: (item: string) => { html: string, isContainingCharacter: boolean }) {
        let result = renderHtmlStrategy(this.item);
        this.html = result.html;
        this.isContainingCharacter = result.isContainingCharacter;
    }

    public readonly html: string;
    public readonly isContainingCharacter: boolean;

    public map(func: (v: ViewItem) => ViewItem){
        return func(this);
    }

    public concatHtml(v: ViewItem): ViewItem{
        let containing = this.isContainingCharacter
        let newOne = new ViewItem(this.html + v.html, item => {return {html: item, isContainingCharacter: containing}} );
        return newOne;
    }
}

/**
 * This returns strategy selector.
 * If a last charactor is on a line, a strategy is changed.
 * @param cCol item's col number
 * @param width terminal width
 * @param lineFeedRenderHtmlStrategy if cCol equals to width, this is applied.
 * @param defaultRenderHtmlStrategy if cCol does not equals to width, this is applied.
 */
export function makeStrategySelectorWithColumn(cCol: number
    , width: number
    , lineFeedRenderHtmlStrategy: (item: string) => { html: string, isContainingCharacter: boolean }
    , defaultRenderHtmlStrategy: (item: string) => { html: string, isContainingCharacter: boolean }): (v: ViewItem) => ViewItem {
    if(cCol == width)
        return (v: ViewItem) => {
            return new ViewItem(v.item, lineFeedRenderHtmlStrategy);
        };
    else
        return (v: ViewItem) => {
            if(v.renderHtmlStrategy == defaultRenderHtmlStrategy)
                return v;
            else
                return new ViewItem(v.item, defaultRenderHtmlStrategy);
        };
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
        item = item.replace(' ', '&nbsp;');
        item = item.replace(keyMap.Linefeed, '<br/>');
        item = item.replace(keyMap.Tab, '&nbsp;&nbsp;&nbsp;&nbsp;');
        html = item;
    }
    return { 'html': html, 'isContainingCharacter': isContaingCharacter };
}

function lineFeedRenderHtmlStrategy(item: string): { html: string, isContainingCharacter: boolean } {
    return defaultRenderStrategy(item + keyMap.Linefeed);
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
     * like ANSI Escape sequences 
     * https://www.novell.com/documentation/extend5/Docs/help/Composer/books/TelnetAppendixB.html
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

/**
 * A terminal buffer is a core object for web terminal.
 * This object accepts input and renders html elements.
 */
export class TerminalBuffer extends Buffer<ViewItem> {
    constructor(private width: number = 80, private renderHtmlStrategy: (item: string) => { html: string, isContainingCharacter: boolean } = defaultRenderStrategy, private ansiEscapeMode = false) {
        super();
        this.init();
    }

    public cacheIndex: number = 0;
    public cache: ViewItem;
    public setCache(destIndex: number) {
        if(destIndex >= this.buf.length)
            destIndex = this.buf.length;
        if(Math.abs(destIndex - this.cacheIndex) > 1000){
            console.info(`Cooking a cache at ${destIndex}`);
            this.cacheIndex = destIndex;
            this.cache = this.buf[0];
            for(let i = 1; i < this.cacheIndex ; i++){
                this.cache = this.cache.concatHtml(this.buf[i]);
            }
        }
    }
    /*
    setCache(baseString: string) {
        let foundIndex: number = -1;
        for (let i = this.buf.length - baseString.length; i >= 0; i--) {
            let matchCount = 0;
            for (let j = 0; j < baseString.length; j++) {
                let indexInBuf = i + j;
                if (this.buf[indexInBuf].item == baseString[j]) {
                    matchCount += 1;
                } else
                    break;
            }
            if (matchCount == baseString.length) {
                foundIndex = i;
                break;
            }
        }

        if (foundIndex != -1 && (foundIndex != this.cacheIndex)) {
            this.cacheIndex = foundIndex;
            let v = new ViewItem('', (i) => { return { html: '', isContainingCharacter: false }; })
            for (let i = 0; i < this.cacheIndex; i++) {
                v.html += this.buf[i].html;
            }
            this.cache = v;
        }
    }*/

    protected init(){
        super.init();
        this.rightOrExtendRight(new ViewItem(' ', this.renderHtmlStrategy));
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

    public isInsertMode(): boolean {
        return this.insertMode;
    }

    public getWriteObservable(): Observable<string> {
        return this.writeSubject;
    }

    public setAnsiEscapeMode(b: boolean) {
        this.init();
        this.ansiEscapeMode = b;
    }

    public getAnsiEscapeMode(): boolean{
        return this.ansiEscapeMode;
    }

    public setWidth(width: number) {
        if (width < 1)
            return
        else
            this.width = width;
    }

    public getWidth(){
        return this.width;
    }

    public getRowCol(targetIndex: number = this.index): { row: number, col: number } {
        let cRow = 1;
        let cColumn = 1;
        let foundRow = undefined;
        let foundCol = undefined;
        this.buf.every((viewItem, index) => {
            let ch = viewItem.item
            if (targetIndex == index) {
                foundRow = cRow;
                foundCol = cColumn;
                return false;
            }
            if (ch == keyMap.Linefeed) {
                cRow++;
                cColumn = 1;
            } else if (cColumn == this.width) {
                cRow++;
                cColumn = 1;
            } else
                cColumn++;
            return true;
        })
        if (foundRow == undefined || foundCol == undefined)
            return undefined;
        else
            return { row: foundRow, col: foundCol };
    }

    private getLastColumn(row: number): number {
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
            if (ch == keyMap.Linefeed) {
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


    private invalidate(fromRow: number = 1, toRow: number = 1 + Math.floor((this.buf.length - 1) / this.width)){
        console.debug(`invalidate from ${fromRow} to ${toRow}`);
        fromRow = Math.floor(fromRow);
        toRow = Math.floor(toRow);
        if(!this.ansiEscapeMode){
            console.debug("invalidating does work only with ansi mode");
            return;
        }
        if(fromRow < 1){
            console.debug("invalid parameter: " + fromRow);
            fromRow = 1;
        }
        this.setCache((fromRow - 1) * this.width - 1);
        let bufLen = this.buf.length;
        for(let r=fromRow; r <= toRow; r++){
            for(let c=1; c <= this.width; c++){
                let currentIndex = (r-1) * this.width + c - 1;
                if(currentIndex < bufLen){
                    let strategy = makeStrategySelectorWithColumn(c, this.width, lineFeedRenderHtmlStrategy, this.renderHtmlStrategy);
                    this.overwriteOnIndex(currentIndex, this.buf[currentIndex].map(strategy));
                }else
                    return;
            }
        }
    }

    /**
     * Fill a buffer, if buffer length is smaller than sum of row and col.
     * @param row 
     * @param column 
     */
    private padding(row: number, column: number) {
        let flatCol = (row-1) * this.width + column;
        if ((this.buf.length < flatCol) && this.ansiEscapeMode) {
            let count = flatCol - this.buf.length
            this.moveRightMost(); // should change current position before a location to fill padding.
            while (count--){
                this.rightOrExtendRight(new ViewItem(' ', this.renderHtmlStrategy))
            }
        }
    }

    private getIndex(row: number = undefined, column: number = undefined): number {
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
        this.padding(row, column)
        let cRow = 1;
        let cColumn = 1;
        let foundIndex = undefined;
        let ignoreList = [];
        this.buf.every((viewItem, index) => {
            let ch = viewItem.item
            if (cRow == row && cColumn == column){
                foundIndex = index;
                return false;
            }
            if (ch == keyMap.Linefeed) {
                cRow++;
                cColumn = 1;
            } else if (cColumn == this.width) {
                cRow++;
                cColumn = 1;
            } else
                cColumn++;
            return true;
        })
        return foundIndex;
    }

    private insertMode = true;
    private writeSubject = new Subject<string>();

    private up() {
        while (this.index > 0) {
            this.left()
            let item = this.current();
            if (item.item == keyMap.Linefeed) {
                break;
            }
        }
    }

    private down() {
        while (this.index < this.buf.length - 1) {
            let item = this.current();
            if (item.item == keyMap.Linefeed) {
                if (this.index != this.buf.length - 1)
                    this.right();  
                break;
            }
            this.right();
        }
    }

    private home() {
        this.up();
        if (this.index != 0)
            this.down();
    }

    private end() {
        this.down();
        if (this.index != this.buf.length - 1)
            this.up();
    }

    private toggleInsertKey() {
        this.insertMode = !this.insertMode;
    }
/*
    private adjustLineFeed(){
        if(this.ansiEscapeMode){
            
            var len = this.getBufLength() / this.width;
            while(len)
            if(rc.col == this.width){
                e = new ViewItem(e.item + keyMap.Linefeed, this.renderHtmlStrategy);
            }
        }
    }
*/
    /*protected overwrite(e: ViewItem): boolean {
        if(this.ansiEscapeMode){
            let rc = this.getRowCol();
            if(rc.col == this.width){
                e = new ViewItem(e.item + keyMap.Linefeed, this.renderHtmlStrategy);
            }
        }
        return super.overwrite(e)
    }*/

    //This follows telnet keys with ascii. https://www.novell.com/documentation/extend5/Docs/help/Composer/books/TelnetAppendixB.html
    private handle(ch: string) {
        console.debug('handle():' + ch);
        if (this.ansiEscapeMode && this.handleAsciiEscape(ch)) {

        } else if (ch == keyMap.BackSpace) {
            if (this.left()){
                this.pullLeft();
            }
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
        /*    let rc = this.getRowCol()
            let index = this.getIndex(rc.row, 1)
            if (index != undefined)
                this.setIndex(index);
                */
            this.home();
        } else if (ch == keyMap.Insert) {
            this.toggleInsertKey();
        } else if (ch == keyMap.Delete) {
            if (this.right() && this.left()){
                this.pullLeft();
            }
        } else {
            if (ch.length != 0) {
                let first = ch[0];
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
        this.invalidate((this.index - 1)/this.width);
        return true;
    }

    private handleAsciiEscape(ch: string) {
        if (this.findTokenRegex(ch, keyMap.FnArrowUp, true) != null) {
            let m = this.findTokenRegex(ch, keyMap.FnArrowUp, true).matched;
            let defaultValue = 1
            let repeatCount = parseInt(m[1] != '' ? m[1] : defaultValue);
            console.debug('FnArrowUp:' + repeatCount);
            while (repeatCount > 0) {
                let rc = this.getRowCol()
                let index = this.getIndex(rc.row - 1, rc.col)
                if (index == undefined)//fallback1
                    index = this.getIndex(rc.row - 1, this.getLastColumn(rc.row - 1))
                if (index == undefined)//fallback2
                    index = this.getIndex(rc.row, 1)
                if (index != undefined)
                    this.setIndex(index);
                repeatCount--;
            }
            return true;
        } else if (this.findTokenRegex(ch, keyMap.FnArrowDown, true) != null) {
            let m = this.findTokenRegex(ch, keyMap.FnArrowDown, true).matched;
            let defaultValue = 1;
            let repeatCount = parseInt(m[1] != '' ? m[1] : defaultValue);
            console.debug('FnArrowDown:' + repeatCount);
            while (repeatCount > 0) {
                let rc = this.getRowCol()
                let index = this.getIndex(rc.row + 1, rc.col)
                if (index == undefined)//fallback1
                    index = this.getIndex(rc.row + 1, this.getLastColumn(rc.row + 1))
                if (index == undefined)//fallback2
                    index = this.getIndex(rc.row, this.getLastColumn(rc.row))
                if (index != undefined)
                    this.setIndex(index);
                repeatCount--;
            }
            return true;
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
                this.setIndex(index);
            console.debug('FnCursorCharacterAbsolute:' + JSON.stringify(this.getRowCol(this.index)));
            return true;
        } else if (this.findTokenRegex(ch, keyMap.FnEraseInLine, true) != null) {
            let m = this.findTokenRegex(ch, keyMap.FnEraseInLine, true).matched;
            let defaultValue = 0;
            let selector = parseInt(m[1] != '' ? m[1] : defaultValue);
            console.debug('FnEraseInLine:' + selector);
            let rc = this.getRowCol();
            let lastCol = this.getLastColumn(rc.row);
            let countToRight = lastCol - rc.col + 1;
            let countToLeft = rc.col - 1;
            if (selector == 0) {
                this.write(keyMap.Delete.repeat(countToRight));
                this.write(' '.repeat(countToRight));
                this.write(keyMap.ArrowLeft.repeat(countToRight));
            } else if (selector == 1) {
                this.write(keyMap.BackSpace.repeat(countToLeft));
                this.write(' '.repeat(countToLeft));
            } else if (selector == 2) {
                this.write(keyMap.Delete.repeat(countToRight) + ' '.repeat(countToRight) + keyMap.ArrowLeft.repeat(countToRight) + keyMap.BackSpace.repeat(countToLeft));
                this.write(' '.repeat(countToLeft));
            }
            return true;
        }
        return false;
    }

    private findTokenRegex(ch: string, func: Function, isFullMatch = false): { regExp: Function, matched: Array<any> } {
        let fullMatch = isFullMatch ? "$" : "";
        //        console.debug('up: ' + new RegExp("^" + keyMap.FnArrowUp('([0-9]+)', true) + fullMatch));
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

    private tokenize(fullText: string): Array<string> {
        let getToken: (fullText: string) => string = (fullText: string) => {
            if (fullText.length == 0)
                return undefined;
            var keys = Object.keys(keyMap);
            let foundKey = keys
                .filter((v, i, arr) => {
                    if (typeof keyMap[v] === "function" && this.ansiEscapeMode)
                        return this.findTokenRegex(fullText, keyMap[v]) != null;
                    else if (typeof keyMap[v] === "string")
                        return fullText.startsWith(keyMap[v]);
                })
                .map((v, i, arr) => {
                    if (typeof keyMap[v] === "function" && this.ansiEscapeMode)
                        return this.findTokenRegex(fullText, keyMap[v]).matched[0];
                    else if (typeof keyMap[v] === "string")
                        return keyMap[v];
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
}
