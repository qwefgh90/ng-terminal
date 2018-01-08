import { Component, OnInit, OnChanges, Input, ViewChild, Output, EventEmitter } from '@angular/core';
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
import { TerminalBuffer } from './terminal-buffer';
@Component({
    selector: 'ng-terminal',
    templateUrl: './ng-terminal.component.html',
    styleUrls: ['./ng-terminal.component.css'],
    animations: [
        trigger('cursorState', [
            state('inactive', style({
                background: 'white'
            })),
            state('active', style({
            })),
            transition('* <=> *', animate('100ms'))
        ])
    ]
})
export class NgTerminalComponent implements OnInit, OnChanges {
    @ViewChild('terminalViewPort') terminalViewPort: ElementRef;
    @ViewChild('terminalCanvas') terminalCanvas: ElementRef;
    public bf = new TerminalBuffer();
    private keyEventQueue = new Array<any>();

    @Output() onInit = new EventEmitter<TerminalBuffer>();
    @Output() onKey = new EventEmitter<KeyboardEvent>();

    constructor() {
    }

    ngOnInit() {
        this.onInit.next(this.bf);
    }

    ngOnChanges() {
    }

    onKeyDown($event) {
        if (this.isViewPortInFocus()) {
            this.keyEventQueue.push($event);
            console.log($event);
            $event.preventDefault();
            this.emitNextKey();
        }
    }

    private emitNextKey() {
        if (this.keyEventQueue.length > 0) {
            let first = this.keyEventQueue.splice(0, 1)[0];
            this.onKey.emit(first);
        }
    }

    private isViewPortInFocus() {
        return this.terminalViewPort.nativeElement == document.activeElement;
    }

    onViewPortFocus() {
        console.log("focus");
    }
}

/*    cursorState: string = 'active'; //active or inactive(visible or invisable)
      prompt: string = "";
      userInput: string = "";
      private progress: boolean = false;
      blockList: Array<Block> = [];
      private keyEventQueue = new Array<any>();
      
      @ViewChild('terminalViewPort') terminalViewPort: ElementRef;
      @ViewChild('terminalCanvas') terminalCanvas: ElementRef;
      @Output() onNext = new EventEmitter<Disposable>();
      @Output() onInit = new EventEmitter<Disposable>();
      @Input() consumeMode: boolean = true;
      
      private cursorSubject = new Subject<number>();
      private messageSubject = new Subject<Message>();
      
      constructor() {
      this.registerToggleChangeStream();
      this.registerDisposableMessageStream();
      }
      
      ngOnInit() {
      let disposable = new Disposable(undefined, this.messageSubject, this.consumeMode);
      this.onInit.emit(disposable);
      }
      
      ngOnChanges() {
      }
      
      onKeyDown($event) {
      if (this.isViewPortInFocus()) {
      this.keyEventQueue.push($event);
      console.log($event);
      $event.preventDefault();
      if (!this.consumeMode)
      this.emitNextKey();
      else if (!this.isProgress()) {
      this.setProgress(true);
      this.emitNextKey();
      }
      }
      }
      
      private emitNextKey() {
      if (this.keyEventQueue.length > 0) {
      let first = this.keyEventQueue.splice(0, 1)[0];
      let disposable = new Disposable(first, this.messageSubject, this.consumeMode);
      this.onNext.emit(disposable);
      }
      }
      
      private setProgress(s) {
      this.progress = s;
      }
      
      private isProgress() {
      return this.progress;
      }
      
      private clearBuffer() {
      this.keyEventQueue = new Array<any>();
      }
      
      private isViewPortInFocus() {
      return this.terminalViewPort.nativeElement == document.activeElement;
      }
      
      private scrollDown() {
      setTimeout(() => { this.terminalViewPort.nativeElement.scrollTop = this.terminalViewPort.nativeElement.scrollHeight; }, 200);
      }
      
      //It must be called at regular intervals (for example, > 1ms).
      private toggleCursorState() {
      if (this.cursorState === 'active')
      this.cursorState = 'inactive';
      else
      this.cursorState = 'active';
      }
      
      private registerDisposableMessageStream() {
      this.messageSubject.subscribe({
      next: (message: Message) => {
      if (message instanceof Forward) {
      this.userInput = message.strategy(message.event, this.userInput);
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
      } else if (message instanceof StartToEmitKey) {
      this.emitNextKey();
      this.setProgress(false);
      this.cursorSubject.next();
      } else if (message instanceof ClearBuffer) {
      this.clearBuffer();
      }
      }
      });
      }
      
      //Debounce stream solves the issue of invalid changes on a transition.
      //So, cursurState must be handled in debounce observable.
      //It centralizes all events.
      private registerToggleChangeStream() {
      this.cursorSubject.pipe(
      debounceTime(400)
      ).subscribe({
      next: () => {
      if (this.isProgress())
      this.cursorState = 'inactive';
      else if (this.isViewPortInFocus())
      this.toggleCursorState();
      else
      this.cursorState = 'active';
      }
      });
      }
      
      onViewPortFocus() {
      this.cursorSubject.next();
      }
      
      onCursorDone($event) {
      this.cursorSubject.next();
      }
      }*/
/*
  export class Disposable {
  private used: boolean = false;

  constructor(readonly event, private subject: Subject<Message>, private consumeBreak: boolean = true) {
  }
  public isUsed() {
  return this.used;
  }
  public print(text: string): Disposable {
  if (!this.isUsed()) {
  if (text == undefined)
  text = '';
  this.subject.next(new Print(text));
  }
  return this;
  }
  public println(text: string): Disposable {
  if (!this.isUsed()) {
  if (text == undefined)
  text = '';
  this.subject.next(new Println(text));
  }
  return this;
  }
  public clearEventBuffer(): Disposable {
  if (!this.isUsed()) {
  this.subject.next(new ClearBuffer());
  }
  return this;
  }
  public skip(): void {
  if (!this.isUsed()) {
  this.subject.next(new StartToEmitKey());
  if (this.consumeBreak) this.used = true;
  }
  }
  public handle(strategy: ($event: any, input: string) => string = defaultStrategy): void {
  if (!this.isUsed()) {
  this.subject.next(new Forward(this.event, strategy));
  this.subject.next(new StartToEmitKey());
  if (this.consumeBreak) this.used = true;
  }
  }
  public prompt(prompt: string): void {
  if (!this.isUsed()) {
  if (prompt == undefined)
  prompt = '';
  this.subject.next(new Prompt(prompt));
  this.subject.next(new StartToEmitKey());
  if (this.consumeBreak) this.used = true;
  }
  }
  }

  export function defaultStrategy(event: any, input: string): string {
  if (event.key == 'Backspace')
  input = input.substring(0, input.length - 1)
  else if (event.key == ' ')
  input = input + ' ';
  else if (event.key.length == 1)
  input = input + event.key;
  return input;
  }

  export interface Message {
  }

  export class Forward implements Message {
  constructor(readonly event, readonly strategy: ($event: any, input: string) => string) { }
  }

  export class Print implements Message {
  constructor(readonly text: string) { }
  }

  export class Println implements Message {
  constructor(readonly text: string) { }
  }

  export class Prompt implements Message {
  constructor(readonly prompt: string) { }
  }

  export class ClearBuffer implements Message {
  constructor() { }
  }

  export class StartToEmitKey implements Message {
  constructor() { }
  }

  export class Block {
  constructor(readonly prompt: string, readonly text: string) { }
  }
*/
