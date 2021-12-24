import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-test',
  template: `
    <p>
      test works!
    </p>
  `,
  styles: [
  ]
})
export class TestComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
