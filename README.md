# NgTerminal

NgTerminal is a interactive terminal component on Angular. `NgTerminal` component is simply controlled by `Disposible` object.

This project contains a example and a core library.

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

Implements your callback functions to your `app.component.ts`.

```typescript
    onInit(disposible: Disposible) {
      disposible.println('https://github.com/qwefgh90/ng-terminal').println('Welcome to NgTerminal!!').prompt('ng>');
    }

    onNext(disposible: Disposible) {
      if (disposible.event.key == 'Enter') {
        let newDisposible = disposible.println('').println('something is in progress...')
        setTimeout(() => { newDisposible.println('').print('').print('complete!').prompt('ng>'); }, 2000);
      } else
        disposible.handle();
}
```

And, add `<ng-terminal>` to your `app.component.html`.

```html
  <ng-terminal (onInit)="onInit($event)" (onNext)="onNext($event)">
  </ng-terminal>
```

## API

Here is `<ng-terminal>` tag that you can use in your templates.

```html
    <ng-terminal
      (onInit)="onInit($event)" 
      (onNext)="onNext($event)">
    </ng-terminal>
```

**Here are descriptions about a part of component.**

#### NgTerminal

`<ng-terminal>` is a angular component that put into your applications.

```typescript
class ngTerminalComponent {
  onInit(disposible: Disposible)
  onNext(disposible: Disposible)
}
```

*You must register two callback functions.* After `NgTerminal` component is initialized, `onInit()` is called only **once** like ngInit(). Whenever user enter a charactor, `onNext()` is called.

#### Disposible 

Disposible is a disposible object **for interacion with terminal.**

```typescript
class Disposible {
  /* print methods */
  print(text: string): Disposible
  println(text: string): Disposible
  /* stopping methods which need to be called for continuing to accept a next command.*/
  skip()
  handle(strategy: ($event: any, input: string) => string = defaultStrategy)
  prompt()
}
```

*You must call one of stopping methods to continue to accept a next command.*


## Contribution

NgTerminal is devleoped with Angular CLI.
When you find bugs or want to improve, you can write issue and PR to "develop" branch.

## Reference

- ng-packagr: https://medium.com/@ngl817/building-an-angular-4-component-library-with-the-angular-cli-and-ng-packagr-53b2ade0701e
