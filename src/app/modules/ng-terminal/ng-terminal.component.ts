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
    @Input() renderHtmlStrategy: (item: string) => { html: string, isContainingCharacter: boolean };

    constructor() {
    }

    ngOnInit() {
        this.onInit.next(this.bf);
    }

    ngOnChanges() {
        if (this.renderHtmlStrategy != undefined && this.renderHtmlStrategy != null)
            this.bf.setRenderHtmlStrategy(this.renderHtmlStrategy);
    }

    onKeyDown($event) {
        if (this.isViewPortInFocus()) {
            this.keyEventQueue.push($event);
            $event.preventDefault();
            this.emitNextKey();
        }
    }

    private scrollDown() {
        setTimeout(() => { this.terminalViewPort.nativeElement.scrollTop = this.terminalViewPort.nativeElement.scrollHeight; }, 200);
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
    }
}
