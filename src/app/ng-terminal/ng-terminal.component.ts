import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import {
    trigger,
    state,
    style,
    animate,
    transition
} from '@angular/animations';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ElementRef, Renderer2 } from '@angular/core';

@Component({
    selector: 'app-ng-terminal',
    templateUrl: './ng-terminal.component.html',
    styleUrls: ['./ng-terminal.component.css'],
    animations: [
        trigger('cursorState', [
            state('inactive', style({
                opacity: '0'
            })),
            state('active', style({
                opacity: '1'
            })),
            transition('* <=> *', animate('100ms'))
        ])
    ]
})
export class NgTerminalComponent implements OnInit {
    cursorState: string = 'active';
    userInput: string = "hellhelassloasdfasdfasdfsdfhelo<br>hello";
    progress: boolean = false;
    @ViewChild('terminalViewPort') terminalViewPort: ElementRef;
    @ViewChild('terminalCanvas') terminalCanvas: ElementRef;
    @Output() onNext = new EventEmitter<Disposible>();

    private debounceSubject = new Subject<number>();
    private messageSubject = new Subject<Message>();
    private keyEventQueue = new Array<any>();
    constructor() {
        this.registerToggleChangeStream();
    }

    ngOnInit() {
    }

    private keyDownHandler($event) {
        if (this.isViewPortInFocus()) {
            console.log($event);
            this.keyEventQueue.push($event);
            $event.preventDefault();
            this.nextKeyEvent();
        }
    }

    private nextKeyEvent() {
        if (this.keyEventQueue.length > 0 && !this.isProgress()) {
            this.setProgress(true);
            let first = this.keyEventQueue.splice(0, 1)[0];
            let disposible = new Disposible(first, this.messageSubject);
            this.onNext.emit(disposible);
        }
    }

    private setViewPortFocus() {
        this.debounceSubject.next();
    }

    private setProgress(s) {
        this.progress = s;
    }

    private isProgress() {
        return this.progress;
    }

    private isViewPortInFocus() {
        return this.terminalViewPort.nativeElement == document.activeElement;
    }

    registerDisposibleMessageStream() {
        this.messageSubject.subscribe({
            next: (message: Message) => {
                if (message instanceof Forward) {
                    this.userInput = this.userInput + message.event.key;
                    this.terminalViewPort.nativeElement.scrollTop = this.terminalViewPort.nativeElement.scrollHeight;
                } else if (message instanceof Print) {
                    this.userInput = this.userInput + message.html;
                    this.terminalViewPort.nativeElement.scrollTop = this.terminalViewPort.nativeElement.scrollHeight;
                } else if (message instanceof Prompt) {
                    this.setProgress(false);
                    this.nextKeyEvent();
                }
            }
        });
    }

    //Debounce stream solves the issue of invalid changes on a transition.
    //So, cursurState must be handled in debounce observable.
    //It centralizes all events.
    private registerToggleChangeStream() {
        this.debounceSubject.pipe(
            debounceTime(400)
        ).subscribe({
            next: () => {
                if (this.isViewPortInFocus())
                    this.toggleCursorState();
                else
                    this.cursorState = 'active';
            }
        });
    }

    //It must be called at regular intervals (for example, > 1ms).
    private toggleCursorState() {
        if (this.cursorState === 'active')
            this.cursorState = 'inactive';
        else
            this.cursorState = 'active';
    }

    private onDone($event) {
        this.debounceSubject.next();
    }
}

interface Message {
}
class Forward implements Message {
    constructor(readonly event) { }
}
class Print implements Message {
    constructor(readonly html: string) { }
}
class Prompt implements Message {
    constructor() { }
}

export class Disposible {
    private used: boolean = false;

    constructor(readonly event, private subject: Subject<Message>) {
    }
    public forward(): Disposible {
        this.subject.next(new Forward(event));
        return this;
    }
    public print(html: string): Disposible {
        this.subject.next(new Print(html));
        return this;
    }
    public next(): void {
        this.subject.next(new Prompt());
        this.used = true;
    }
}
