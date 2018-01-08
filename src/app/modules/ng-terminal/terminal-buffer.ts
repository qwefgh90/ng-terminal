class ViewItem {
    constructor(item: string, renderHtmlStrategy: (item: string) => string) {
        this.item = item;
        this.html = renderHtmlStrategy(this.item)
    }
    public item: string;
    html: string;
}

class Buffer<T> {
    public buf: Array<T> = new Array<T>();//only allowed to modify data with low level API
    public index: number = 0;//cursor offset
    /*
     * low level API
     * [a,b,c,d]+[?] range in (buffer + 1)
     */
    //cursor move left in leftmost boundary
    public left() {
        if (this.index > 0)
            this.index--;
    }
    //cursor move right in rightmost boundary + 1
    public right() {
        if (this.index < this.buf.length) {
            this.index++;
        }
    }
    //overwrite, if positioned at boundary + 1, push it
    protected overwrite(e: T) {
        if (this.index == this.buf.length) {
            this.buf.push(e)
        } else
            this.buf[this.index] = e;
    }
    /*
        //pullLeft
        protected pullLeft() {
            for (let i = this.i + 1; i < this.b.length; i++) {
                this.b[i - 1] = this.b[i];
            }
        }
        //drop last element
        protected dropLast() {
            this.b.splice(this.b.length - 1, 1)
        }
    */
}

export function defaultRenderStrategy(item: string): string {
    let html;
    if (item == ' ') {
        html = '&nbsp;'
    } else if (item == '\n') {
        html = '<br/>';
    } else if (item == '\t') {
        html = '&nbsp;&nbsp;&nbsp;&nbsp;';
    } else {
        html = item;
    }
    return html;
}

export class TerminalBuffer extends Buffer<ViewItem> {
    constructor(readonly renderHtmlStrategy: (item: string) => string = defaultRenderStrategy) {
        super();
        this.overwrite(new ViewItem(' ', renderHtmlStrategy));
    }
    public writeArray(list: Array<string>) {
        for (let e of list) {
            for (let i = 0; i < e.length; i++) {
                let ch = e.charAt(i);
                this.handle(ch);
            }
        }
    }
    public write(e: string) {
        for (let i = 0; i < e.length; i++) {
            let ch = e.charAt(i);
            this.handle(ch);
        }
    }
    private handle(ch: string) {
        if (ch == '\b') {
            this.left()
        } else {
            this.overwrite(new ViewItem(ch, this.renderHtmlStrategy))
            this.right()
            this.overwrite(new ViewItem(' ', this.renderHtmlStrategy))
        }
    }
}
