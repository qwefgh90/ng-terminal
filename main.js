(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "./src/$$_lazy_route_resource lazy recursive":
/*!**********************************************************!*\
  !*** ./src/$$_lazy_route_resource lazy namespace object ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./src/$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "./src/app/app.module.ts":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/fesm5/platform-browser.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/material/slide-toggle */ "./node_modules/@angular/material/esm5/slide-toggle.es5.js");
/* harmony import */ var _angular_material_button__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/material/button */ "./node_modules/@angular/material/esm5/button.es5.js");
/* harmony import */ var _angular_material_input__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/input */ "./node_modules/@angular/material/esm5/input.es5.js");
/* harmony import */ var ng_terminal__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ng-terminal */ "./node_modules/ng-terminal/fesm5/ng-terminal.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/platform-browser/animations */ "./node_modules/@angular/platform-browser/fesm5/animations.js");
/* harmony import */ var _angular_material_card__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material/card */ "./node_modules/@angular/material/esm5/card.es5.js");
/* harmony import */ var ngx_json_viewer__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ngx-json-viewer */ "./node_modules/ngx-json-viewer/ngx-json-viewer.es5.js");
/* harmony import */ var _example_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./example.component */ "./src/app/example.component.ts");
/* harmony import */ var _angular_material_form_field__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/material/form-field */ "./node_modules/@angular/material/esm5/form-field.es5.js");













var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_2__["NgModule"])({
            declarations: [
                _example_component__WEBPACK_IMPORTED_MODULE_11__["ExampleComponent"]
            ],
            imports: [
                _angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__["BrowserModule"],
                ng_terminal__WEBPACK_IMPORTED_MODULE_6__["NgTerminalModule"],
                _angular_material_button__WEBPACK_IMPORTED_MODULE_4__["MatButtonModule"],
                _angular_material_slide_toggle__WEBPACK_IMPORTED_MODULE_3__["MatSlideToggleModule"],
                _angular_material_input__WEBPACK_IMPORTED_MODULE_5__["MatInputModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_7__["ReactiveFormsModule"],
                _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_8__["BrowserAnimationsModule"],
                _angular_material_card__WEBPACK_IMPORTED_MODULE_9__["MatCardModule"],
                ngx_json_viewer__WEBPACK_IMPORTED_MODULE_10__["NgxJsonViewerModule"],
                _angular_material_form_field__WEBPACK_IMPORTED_MODULE_12__["MatFormFieldModule"]
            ],
            providers: [],
            bootstrap: [_example_component__WEBPACK_IMPORTED_MODULE_11__["ExampleComponent"]]
        })
    ], AppModule);
    return AppModule;
}());



/***/ }),

/***/ "./src/app/example.component.css":
/*!***************************************!*\
  !*** ./src/app/example.component.css ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2V4YW1wbGUuY29tcG9uZW50LmNzcyJ9 */"

/***/ }),

/***/ "./src/app/example.component.html":
/*!****************************************!*\
  !*** ./src/app/example.component.html ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<h2>{{title}}</h2>\n<ng-terminal [dataSource]=\"writeSubject\" (keyInput)=\"onKeyInput($event)\" [displayOption]=\"displayOptionBounded\">\n</ng-terminal>\n<div [class.mat-elevation-z1]=\"true\" style=\"padding-left: 1em; padding-top: 0.3em; margin-top: 0.7em; padding-bottom: 1em\">\n    <div> \n        <div style=\"display:inline-block; vertical-align: top; margin-bottom: 0.8em\">\n            <h3>Display Opiton</h3>\n            <div>\n                <mat-slide-toggle class=\"example-margin\" [color]=\"color\" (change)=\"resizableChange($event)\"\n                    [disabled]=\"disabled\">\n                    Resizable\n                </mat-slide-toggle>\n            </div>\n            <div>\n                <mat-slide-toggle class=\"example-margin\" [checked]=\"fixed\" [color]=\"color\"\n                    (change)=\"fixedChange($event)\" [disabled]=\"disabled\">\n                    Fixed row and col\n                </mat-slide-toggle>\n            </div>\n            <div>\n                <mat-form-field>\n                    <input matInput placeholder=\"rows\" [formControl]=\"rowsControl\" type=\"number\">\n                </mat-form-field>\n                <mat-form-field>\n                    <input matInput placeholder=\"cols\" [formControl]=\"colsControl\" type=\"number\">\n                </mat-form-field>\n            </div>\n        </div>\n        <div style=\"display:inline-block; vertical-align: top\">\n            <h4>JSON</h4>\n            <ngx-json-viewer [json]=\"displayOptionForLiveUpdate\"></ngx-json-viewer>\n        </div>\n    </div>\n    <h3>Examples of data binding</h3>\n    <div>\n        <span style=\"font-size: 0.8em; font-weight: bold\">[dataSource]</span>\n        <div>\n            <mat-form-field>\n                <input matInput placeholder=\"Type here\" value=\"\" [formControl]=\"inputControl\">\n            </mat-form-field>\n            <button mat-raised-button color=\"primary\" (click)=\"write()\">Write</button>\n        </div>\n    </div>\n    <div>\n        <span style=\"font-size: 0.8em; font-weight: bold\">(keyInput): {{keyInput}}</span>\n    </div>\n</div>"

/***/ }),

/***/ "./src/app/example.component.ts":
/*!**************************************!*\
  !*** ./src/app/example.component.ts ***!
  \**************************************/
/*! exports provided: ExampleComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ExampleComponent", function() { return ExampleComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var ng_terminal__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ng-terminal */ "./node_modules/ng-terminal/fesm5/ng-terminal.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm5/index.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");





var ExampleComponent = /** @class */ (function () {
    function ExampleComponent() {
        this.title = 'NgTerminal Live Example';
        this.color = 'accent';
        this.fixed = true;
        this.disabled = false;
        this.rowsControl = new _angular_forms__WEBPACK_IMPORTED_MODULE_4__["FormControl"]();
        this.colsControl = new _angular_forms__WEBPACK_IMPORTED_MODULE_4__["FormControl"]();
        this.inputControl = new _angular_forms__WEBPACK_IMPORTED_MODULE_4__["FormControl"]();
        this.displayOption = {};
        this.displayOptionBounded = {}; //now it's not used
        this.writeSubject = new rxjs__WEBPACK_IMPORTED_MODULE_3__["Subject"]();
    }
    ExampleComponent.prototype.ngOnInit = function () {
        this.rowsControl.setValue(10);
        this.colsControl.setValue(40);
    };
    ExampleComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.invalidate();
        this.child.keyInput.subscribe(function (input) {
            _this.child.write(input);
        });
        this.rowsControl.valueChanges.subscribe(function () { _this.invalidate(); });
        this.colsControl.valueChanges.subscribe(function () { _this.invalidate(); });
    };
    ExampleComponent.prototype.invalidate = function () {
        if (this.resizable)
            this.displayOption.activateDraggableOnEdge = { minWidth: 100, minHeight: 100 };
        else
            this.displayOption.activateDraggableOnEdge = undefined;
        if (this.fixed)
            this.displayOption.fixedGrid = { rows: this.rowsControl.value, cols: this.colsControl.value };
        else
            this.displayOption.fixedGrid = undefined;
        this.child.setDisplayOption(this.displayOption);
    };
    ExampleComponent.prototype.resizableChange = function (event) {
        this.resizable = event.checked;
        this.invalidate();
    };
    ExampleComponent.prototype.fixedChange = function (event) {
        this.fixed = event.checked;
        this.invalidate();
    };
    ExampleComponent.prototype.write = function () {
        this.writeSubject.next(this.inputControl.value);
    };
    ExampleComponent.prototype.onKeyInput = function (event) {
        this.keyInput = event;
    };
    Object.defineProperty(ExampleComponent.prototype, "displayOptionForLiveUpdate", {
        get: function () {
            return JSON.parse(JSON.stringify(this.displayOption));
        },
        enumerable: true,
        configurable: true
    });
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])(ng_terminal__WEBPACK_IMPORTED_MODULE_2__["NgTerminalComponent"]),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", Object)
    ], ExampleComponent.prototype, "child", void 0);
    ExampleComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-root',
            template: __webpack_require__(/*! ./example.component.html */ "./src/app/example.component.html"),
            styles: [__webpack_require__(/*! ./example.component.css */ "./src/app/example.component.css")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [])
    ], ExampleComponent);
    return ExampleComponent;
}());



/***/ }),

/***/ "./src/environments/environment.ts":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
var environment = {
    production: false
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser-dynamic */ "./node_modules/@angular/platform-browser-dynamic/fesm5/platform-browser-dynamic.js");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "./src/app/app.module.ts");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./environments/environment */ "./src/environments/environment.ts");




if (_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["enableProdMode"])();
}
Object(_angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__["platformBrowserDynamic"])().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"])
    .catch(function (err) { return console.error(err); });


/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /home/travis/build/qwefgh90/ng-terminal/src/main.ts */"./src/main.ts");


/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map