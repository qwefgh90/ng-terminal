# NgTerminal

NgTerminal is a interactive terminal component on Angular. Simply `NgTerminal` component is controlled by `Disposible` object.

This project contains a example and a core library.

## Running example

You can run this project in local.

- git clone https://github.com/qwefgh90/ng-terminal.git
- ng serve

## API

Here is `<ng-terminal>` tag that you can use in your templates. 

```html
    <ng-terminal
      (onInit)="onInit($event)" 
      (onNext)="onNext($event)">
    </ng-terminal>
```

**Here are descriptions about a part of component.**

### NgTerminal

`<ng-terminal>` is a angular component that inserted into your applications.

#### onInit(disposible: Disposible)

*Must register it!*

After `NgTerminal` component is initialized, `onInit()` is called only **once** like ngInit().

#### onNext(disposible: Disposible)

*Must register it!*

Whenever user enter a charactor, `onNext()` is called.

### Disposible 

Disposible is a disposible object **for interacion with terminal.** You must call **one of stopping methods** to continue to use a terminal.

**here are continuing methods**

#### print(text: string): Disposible
#### println(text: string): Disposible

**here are stopping methods** You must call **one of these methods** to continue to use a terminal.

#### skip()
#### handle(strategy: ($event: any, input: string) => string = defaultStrategy)
#### prompt()

## Contribution

NgTerminal is devleoped with Angular CLI.
When you find bugs or want to improve, you can write issue and PR to "develop" branch.

## Reference

- ng-packagr: https://medium.com/@ngl817/building-an-angular-4-component-library-with-the-angular-cli-and-ng-packagr-53b2ade0701e
