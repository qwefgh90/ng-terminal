import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

/**
 * Low level buffer implementation 
 */
export class Buffer<T> {
    public buf: Array<T> = new Array<T>();  //only allowed to modify data with low level API
    public index: number = -1;  //only allowed to modify data with low level API

    protected init(){
        this.buf.splice(0, this.buf.length);
        this.index = -1;
    }

    protected moveRightMost() {
        if(this.right())
            this.moveRightMost();
        else
            return;
    }

    protected setIndex(index: number) {
        this.index = index;
    }

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
    protected overwriteOnIndex(index: number, e: T): boolean{
        if(index > 0 && index < this.buf.length){
            this.buf[index] = e;
            return true;
        }else return false;
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
    private extend(e: T) {
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
