import { Component, OnInit } from '@angular/core';
import { NavBarComponent } from "../../nav-bar/nav-bar.component";
import { ActivatedRoute } from '@angular/router';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-introduction-main',
  standalone: true,
  imports: [NavBarComponent],
  templateUrl: './introduction-main.component.html',
  styleUrl: './introduction-main.component.scss'
})
export class IntroductionMainComponent implements OnInit {
  constructor(private route: ActivatedRoute, private viewportScroller: ViewportScroller) {}

  ngOnInit() {
    this.viewportScroller.setOffset([0,70])
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.viewportScroller.scrollToAnchor(fragment);
      }
    });
  }
}
