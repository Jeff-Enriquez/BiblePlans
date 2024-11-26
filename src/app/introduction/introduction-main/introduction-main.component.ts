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
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.scrollToElementWithOffset(fragment, 70)
      } else {
        this.scrollToTop(0)
      }
    });
  }
  scrollToTop(offset: number) {
    window.scrollTo({
      top: offset,
      behavior: 'smooth'
    });
  }
  scrollToElementWithOffset(elementId: string, offset: number): void {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
}
