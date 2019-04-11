# NgTerminal

[![version](https://img.shields.io/badge/ng--terminal-1.0.0-green.svg)](https://www.npmjs.com/package/ng-terminal)

NgTerminal is web terminal on Angular7 or higher. You can easily make web terminal with Angular by adding `<ng-terminal></ng-terminal>` into your component. It's written on xtermjs.

NgTerminal provides some features including [xtermjs](https://xtermjs.org/). It provides to adjust dimensions by dragging and to fix the number of rows and cols.

## Install

```
npm install ng-terminal
```

## Example

You can run a sample project in your local environment.

1) git clone https://github.com/qwefgh90/ng-terminal.git
2) npm install
3) ng serve

#### Descriptions

Modules should be imported in `app.module.ts`.

```typescript
import { NgTerminalModule } from 'ng-terminal';
//your codes
@NgModule({
    imports: [
        NgTerminalModule
    //your codes
```

just add `<ng-terminal>` to your `app.component.html` with your callback functions.
And when you run your component, you can see terminal whose color is black. 

```html
  <ng-terminal></ng-terminal>
```
Now you can control the terminal to print something or etc with `NgTerminal` object which has APIs for developers.
You can get a object by using `@ViewChild` in your component.

```typescript
export class YourComponent implements AfterViewInit{
  @ViewChild(NgTerminalComponent) child: NgTerminal;
  
  ngAfterViewInit(){
    this.invalidate();
    this.child.keyInput.subscribe((input) => {
      this.child.write(input);
    })
  }

  //...
```


## API

#### NgTerminal

`<ng-terminal>` is a angular component which is put into your applications.

```typescript
class ngTerminalComponent {
  @Output() onInit = new EventEmitter<TerminalBuffer>();
  @Output() onKey = new EventEmitter<KeyboardEvent>();
  @Input() renderHtmlStrategy: (item: string) => { html: string, isContainingCharacter: boolean };
}
```

*You must register two callback functions.* After `NgTerminal` component is initialized, `onInit()` is called only **once**. `onInit()` is callback to provides `TerminalBuffer` object and you can control `NgTerminalComponent`'s buffer with this. `onKey()` is called whenever you press key and emit `KeyboardEvent` object.

You can see [KeyboardEvent](https://developer.mozilla.org/ko/docs/Web/API/KeyboardEvent) in developer.mozilla.org.

#### TerminalBuffer

`TerminalBuffer` is new object to control `NgTerminalComponent`'s buffer. so, you must assign `TerminalBuffer` object in a variable and use it.

```typescript
class TerminalBuffer extends Buffer<ViewItem> {
  constructor(private renderHtmlStrategy: (item: string) => { html: string, isContainingCharacter: boolean } = defaultRenderStrategy)
  public setRenderHtmlStrategy(strategy: (item: string) => { html: string, isContainingCharacter: boolean }): void
  public write(e: string): TerminalBuffer
```

##### constructor(private renderHtmlStrategy: (item: string) => { html: string, isContainingCharacter: boolean } = defaultRenderStrategy)

It's `TerminalBuffer`'s constructor. You can initialize custom `renderHtmlStrategy` which decides how to convert your input to html code.

##### public setRenderHtmlStrategy(strategy: (item: string) => { html: string, isContainingCharacter: boolean }): void

In runtime, you can initialize custom `renderHtmlStrategy` which decides how to convert your input to html code.

##### public write(e: string): TerminalBuffer

You can write **characters** to `NgTerminalComponent`'s buffer. Characters is converted to html code with default or custom strategy. Also, `NgTerminalComponent` can accept **telnet's characters.** This is a specialized characters that controls the buffer.

You can see **telnet's characters** in following a link.
[Telnet Keyboard Equivalents](https://www.novell.com/documentation/extend5/Docs/help/Composer/books/TelnetAppendixB.html) and use the table `keyMap`

##### renderHtmlStrategy: (item: string) => { html: string, isContainingCharacter: boolean } = defaultRenderStrategy

By replacing `renderHtmlStratgy`, you can change a rendering way. `renderHtmlStrategy` is used when converting your input to html code. You should know that Input characters is broken into one character which is passed to `item` parameter.

If a html code to be converted doesn't contains any character, `isContainingCharacter` should be false. For example, `<br/>` doesn't contain any chracter.

#### keyMap

`keyMap` is the exported object and **the table of telnet's characters.**

## Contribution

NgTerminal is devleoped with Angular CLI.
When you find bugs or want to improve, you can write issue and PR to **master** branch.

## Reference

- ng-packagr: https://medium.com/@ngl817/building-an-angular-4-component-library-with-the-angular-cli-and-ng-packagr-53b2ade0701e
