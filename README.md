[![Build Status](https://app.travis-ci.com/qwefgh90/ng-terminal.svg?branch=master)](https://app.travis-ci.com/qwefgh90/ng-terminal) [![version](https://badge.fury.io/js/ng-terminal.svg)](https://www.npmjs.com/package/ng-terminal) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)]()

NgTerminal is a web terminal that leverages xterm.js on Angular 12+. You can easily add it into your application by adding `<ng-terminal></ng-terminal>` into your component.

NgTerminal provides some features including [xtermjs](https://xtermjs.org/). You can adjust dimensions of a terminal by dragging and to fix the number of rows and cols. New usuful features should be added continuously.

## Install

```
npm install ng-terminal --save
```

## Run an example locally

You can run an example in your local environment.

1) git clone https://github.com/qwefgh90/ng-terminal.git
2) npm install
4) npm run start

## Getting started

Import `NgTerminalModule` in your **AppModule**.

```typescript
import { NgTerminalModule } from 'ng-terminal';
//...
@NgModule({
    imports: [
        NgTerminalModule
    //...
```

And put `<ng-terminal>` into a source code of **Component**.
Now a web terminal appears where you code it. 
The terminal will do nothing first. So, you should define how to operate.

```html
  <ng-terminal #term></ng-terminal>
```

You can print or do something on the terminal with `NgTerminal` object which has some APIs for developers.
You can get it by using `@ViewChild` in your component. It is important that an object of `NgTerminalComponent` is populated after `ngAfterViewInit()` is called.

You can print something in a terminal by passing them to the `NgTerminal.write()`  function as an argument **as follows**, as soon as it receives user inputs from the terminal.

```typescript
//...
export class YourComponent implements AfterViewInit{
  @ViewChild('term', { static: true }) child: NgTerminal;
  
  ngAfterViewInit(){
    //...
    this.child.keyEventInput.subscribe(e => {
      console.log('keyboard event:' + e.domEvent.keyCode + ', ' + e.key);

      const ev = e.domEvent;
      const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

      if (ev.keyCode === 13) {
        this.child.write('\n' + FunctionsUsingCSI.cursorColumn(1) + '$ '); // \r\n
      } else if (ev.keyCode === 8) {
        if (this.child.underlying.buffer.active.cursorX > 2) {
          this.child.write('\b \b');
        }
      } else if (printable) {
        this.child.write(e.key);
      }
    })
    //...
  }

  //...
```

## NgTerminal

There are two ways to control the terminal. A first way is passing the arguments to input/output properties. API in `NgTerminal` is also a way to control the terminal. You can get a instance of `NgTerminal` by using `@ViewChild`.

### Input/Output properties

Four properties (`dataSource`, `rows`, `cols` and `draggable`) are helpful to construct your temrinal. Check [here](https://qwefgh90.github.io/ng-terminal/).

```html
<ng-terminal #term [dataSource]="writeSubject" (keyEvent)="onKeyEvent($event)" 
[rows]="10" 
[cols]="20" 
[draggable]="false"></ng-terminal>
```

### API

[NgTerminal](https://github.com/qwefgh90/ng-terminal/blob/master/projects/ng-terminal/src/lib/ng-terminal.ts) is a interface to provide public APIs you can call directly. You can get a object by using `@ViewChild` with a type of `NgTerminal`.

```typescript 
  import { NgTerminal } from 'ng-terminal';
  ...
  @ViewChild('term', { static: true }) child: NgTerminal;
```
### Underlying object (Xtermjs)

You can control a instance of the xtermjs directly by getting a property of [underlying](https://github.com/qwefgh90/ng-terminal/blob/master/projects/ng-terminal/src/lib/ng-terminal.ts#L27). Check out API of the Terminal from the [API document](https://xtermjs.org/docs/). 

#### Addons

`ng-terminal` uses only one addon which is [fit](https://github.com/xtermjs/xterm.js/tree/master/addons/xterm-addon-fit) to support the resize feature. If you want to use other addons, you can apply them to a underlying object. Maybe you can do that without any problem.

### Control sequences

Control sequences is a programing interface to control terminal emulators. There are functions to return control sequences in a class of `FunctionUsingCSI`.

```typescript
    import { FunctionsUsingCSI } from 'ng-terminal';
    ...
    const sequences = "data..1" + FunctionsUsingCSI.cursorBackward(1) + '2';
    component.write(sequences);
```

You can find official supported terminal sequences in [Supported Terminal Sequences](https://xtermjs.org/docs/api/vtfeatures/). [An article](https://invisible-island.net/xterm/ctlseqs/ctlseqs.html#h2-Controls-beginning-with-ESC) and [what-are-terminal-sequences](https://xtermjs.org/docs/guides/hooks/#background---what-are-terminal-sequences) are also helpful. For example, you can move a cursor down by passing `\x1b[1E` to `write()`. Try in the [sample page](https://qwefgh90.github.io/ng-terminal/)

## Contribution

NgTerminal is developed with Angular CLI. You can always write issue and contribute through PR to **master** branch.

#### Available commands

- Running an example app in your environment: `npm start`
- Testing ng-terminal: `npm test`
- Creating a tarball for testing with external angular apps: `npm run local`
- (Travis) Creating a static page for this project: `npm run page`
- (Maintainer) Deploying a library to the npm registry: `npm run publish`