import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hold-list',
  templateUrl: './hold-list.component.html',
  styleUrls: ['./hold-list.component.sass']
})
export class HoldListComponent implements OnInit {
  holds: any;
  constructor() { }

  ngOnInit(): void {
  }

}
