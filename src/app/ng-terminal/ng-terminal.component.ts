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
    private cursorState: string = 'active';
    private prompt: string = "";
    private userInput: string = "";
    private progress: boolean = false;
    private blockList: Array<Block> = [];
    @ViewChild('terminalViewPort') terminalViewPort: ElementRef;
    @ViewChild('terminalCanvas') terminalCanvas: ElementRef;
    @Output() onNext = new EventEmitter<Disposible>();
    @Output() onInit = new EventEmitter<Disposible>();

    private debounceSubject = new Subject<number>();
    private messageSubject = new Subject<Message>();
    private keyEventQueue = new Array<any>();
    constructor() {
        this.registerToggleChangeStream();
        this.registerDisposibleMessageStream();
    }

    ngOnInit() {
        let disposible = new Disposible(undefined, this.messageSubject);
        this.onInit.emit(disposible);
    }

    private keyDownHandler($event) {
        if (this.isViewPortInFocus()) {
            console.log($event);
            this.keyEventQueue.push($event);
            $event.preventDefault();
            if (!this.isProgress()) {
                this.setProgress(true);
                this.emitNextKey();
            }
        }
    }

    private emitNextKey() {
        if (this.keyEventQueue.length > 0) {
            let first = this.keyEventQueue.splice(0, 1)[0];
            let disposible = new Disposible(first, this.messageSubject);
            this.onNext.emit(disposible);
        }
    }

    private setProgress(s) {
        this.progress = s;
    }

    private isProgress() {
        return this.progress;
    }

    private onViewPortFocus() {
        this.debounceSubject.next();
    }

    private isViewPortInFocus() {
        return this.terminalViewPort.nativeElement == document.activeElement;
    }

    private scrollDown() {
        setTimeout(() => { this.terminalViewPort.nativeElement.scrollTop = this.terminalViewPort.nativeElement.scrollHeight; }, 300);
    }

    private defaultStrategy(event) {
        if (event.key == 'Backspace')
            this.userInput = this.userInput.substring(0, this.userInput.length - 1)
        else if (event.key == ' ')
            this.userInput = this.userInput + ' ';
        else if (event.key.length == 1)
            this.userInput = this.userInput + event.key;
    }

    registerDisposibleMessageStream() {
        this.messageSubject.subscribe({
            next: (message: Message) => {
                if (message instanceof Forward) {
                    this.defaultStrategy(message.event);
                    this.scrollDown();
                } else if (message instanceof Print) {
                    this.userInput = this.userInput + message.text;
                    this.scrollDown();
                } else if (message instanceof Println) {
                    this.userInput = this.userInput + message.text;
                    this.blockList.push(new Block(this.prompt, this.userInput));
                    this.prompt = '';
                    this.userInput = '';
                    this.scrollDown();
                } else if (message instanceof Prompt) {
                    this.blockList.push(new Block(this.prompt, this.userInput));
                    this.prompt = message.prompt;
                    this.userInput = '';
                    this.scrollDown();
                } else if (message instanceof EmitKey) {
                    this.emitNextKey();
                    this.setProgress(false);
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

export class Disposible {
    private used: boolean = false;

    constructor(readonly event, private subject: Subject<Message>) {
    }
    public print(html: string): Disposible {
        if (html == undefined)
            html = '';
        this.subject.next(new Print(html));
        return this;
    }
    public println(html: string): Disposible {
        if (html == undefined)
            html = '';
        this.subject.next(new Println(html));
        return this;
    }
    public next() {
        this.subject.next(new Forward(event));
        this.subject.next(new EmitKey());
        this.used = true;
    }
    public nextWithPrompt(prompt: string): void {
        if (prompt == undefined)
            prompt = '';
        this.subject.next(new Prompt(prompt));
        this.subject.next(new EmitKey());
        this.used = true;
    }
}

interface Message {
}
class Forward implements Message {
    constructor(readonly event) { }
}
class Print implements Message {
    constructor(readonly text: string) { }
}
class Println implements Message {
    constructor(readonly text: string) { }
}
class Prompt implements Message {
    constructor(readonly prompt: string) { }
}
class EmitKey implements Message {
    constructor() { }
}

class Block {
    constructor(readonly prompt: string, readonly text: string) { }
}
