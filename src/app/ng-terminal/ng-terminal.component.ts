import { Component, OnInit, Input, ViewChild } from '@angular/core';
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
    currentViewPortFocus: boolean = false;
    userInput: string = "hellhelassloasdfasdfasdfsdfhelo<br>hello";
    formatting: string;
    @ViewChild('terminalCanvas') terminalCanvas: ElementRef;

    private debounceSubject = new Subject<number>();
    constructor() {
        this.registerToggleChangeStream();
    }

    ngOnInit() {
    }

    getFormatUserInput() {
        //let formatting = this.userInput;
    }

    onKeyDown($event) {
        console.log('isoverflow: ' + this.isOverflow());
        if (this.currentViewPortFocus) {
            console.log($event);
            $event.preventDefault();
            this.userInput = this.userInput + $event.key;
            //if overflow
            let len = this.userInput.length;
            if (this.isOverflow())
                this.userInput = this.userInput.substring(0, len - 1) + "<br>" + this.userInput.substring(len - 1, len);
        }
    }

    isOverflow() {
        return (this.terminalCanvas.nativeElement.scrollWidth) > (this.terminalCanvas.nativeElement.clientWidth);
    }

    setViewPortFocus(focus) {
        this.currentViewPortFocus = focus;
        this.debounceSubject.next();
    }

    registerToggleChangeStream() {
        //Debounce stream solves the issue of invalid changes on a transition.
        //So, cursurState must be handled in debounce observable.
        //It centralizes all events.
        this.debounceSubject.pipe(
            debounceTime(400)
        ).subscribe({
            next: () => {
                if (this.currentViewPortFocus && document.hasFocus())
                    this.toggleCursorState();
                else
                    this.cursorState = 'active';
            }
        });
    }

    //It must be called at regular intervals (for example, > 1ms).
    toggleCursorState() {
        if (this.cursorState === 'active')
            this.cursorState = 'inactive';
        else
            this.cursorState = 'active';
    }

    onDone($event) {
        this.debounceSubject.next();
    }
}
