# NgTerminal

[![Build Status](https://travis-ci.org/qwefgh90/ng-terminal.svg?branch=master)](https://travis-ci.org/qwefgh90/ng-terminal) [![version](https://badge.fury.io/js/ng-terminal.svg)](https://www.npmjs.com/package/ng-terminal) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)]()

NgTerminal is a web terminal that leverages xterm.js on Angular 7+. You can easily add it into your application by adding `<ng-terminal></ng-terminal>` into your component.

NgTerminal provides some features including [xtermjs](https://xtermjs.org/). It provides to adjust dimensions by dragging and to fix the number of rows and cols. New usuful features to devlopers should be added continuously.

## Install

```
npm install ng-terminal --save
```

## Example

You can run an example in your local environment.

1) git clone https://github.com/qwefgh90/ng-terminal.git
2) npm install
3) npm run lib-build
4) npm run start

## Getting started

`NgTerminalModule` should be imported within **your app module.**

```typescript
import { NgTerminalModule } from 'ng-terminal';
//...
@NgModule({
    imports: [
        NgTerminalModule
    //...
```

Just add `<ng-terminal>` to your `app.component.html`.
And when the application starts, you can see the web terminal to do nothing.

```html
  <ng-terminal #term></ng-terminal>
```

Now you can print or do something on the terminal with `NgTerminal` object which has APIs for developers.
You can get a object by using `@ViewChild` in your component. It is very important that an object of `NgTerminalComponent` is populated after `ngAfterViewInit()` is called.

```typescript
//...
export class YourComponent implements AfterViewInit{
  @ViewChild('term', { static: true }) child: NgTerminal;
  
  ngAfterViewInit(){
    this.invalidate();
    this.child.keyEventInput.subscribe(e => {
      console.log('keyboard event:' + e.domEvent.keyCode + ', ' + e.key);

      const ev = e.domEvent;
      const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

      if (ev.keyCode === 13) {
        this.child.write('\r\n$ ');
      } else if (ev.keyCode === 8) {
        // Do not delete the prompt
        if (this.child.underlying.buffer.cursorX > 2) {
          this.child.write('\b \b');
        }
      } else if (printable) {
        this.child.write(e.key);
      }
    })
  }

  //...
```

## API

There are two ways to control the web terminal. One is to call APIs of NgTerminal directly in your ts code. Another is to use properties or the event binding.

#### NgTerminal

[NgTerminal](https://github.com/qwefgh90/ng-terminal/blob/master/projects/ng-terminal/src/lib/ng-terminal.ts) is a interface to provide public APIs you can call directly. You can get a object by using `@ViewChild` with a type of `NgTerminal`.

```typescript 
  import { NgTerminal } from 'ng-terminal';
  ...
  @ViewChild('term') child: NgTerminal; // for Angular 7
  @ViewChild('term', { static: true }) child: NgTerminal; // for Angular 8
```

#### NgTerminalComponent

[NgTerminalComponent](https://github.com/qwefgh90/ng-terminal/blob/master/projects/ng-terminal/src/lib/ng-terminal.component.ts) is a implementation of `NgTerminal` and the component to draw the terminal.

```html
<ng-terminal #term [dataSource]="writeSubject" (keyEvent)="onKeyEvent($event)" [displayOption]="displayOptionBounded"></ng-terminal>
```

#### Underlying object

You can control a instance of the xtermjs directly by getting a property of [underlying](https://github.com/qwefgh90/ng-terminal/blob/master/projects/ng-terminal/src/lib/ng-terminal.ts#L27). Check out API of the Terminal from the [API document](https://xtermjs.org/docs/)

#### Control sequences

Control sequences is a programing interface to control terminal emulators. There are few implemented functions to return sequences including moving the cursor.

```typescript
    import { FunctionsUsingCSI } from 'ng-terminal';
    ...
    const sequences = "data..1" + FunctionsUsingCSI.cursorBackward(1) + '2';
    component.write(sequences);
```

You can also find a full set of sequences [here](https://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h2-Controls-beginning-with-ESC). For example, you can break lines by passing `\x1b[1E` to `write()`. Try in the [sample page](https://qwefgh90.github.io/ng-terminal/)


## Contribution

NgTerminal is developed with Angular CLI. You can always write issue and contribute through PR to **master** branch.
