import { Component, inject } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { Heading } from '../../interfaces/heading';
import { DATES, YEAR_PLAN } from '../mainBiblePlan';
import { BiblesService } from '../../services/bibles/bibles.service';
import { NavBarComponent } from "../../nav-bar/nav-bar.component";
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-unity-plan-main',
  standalone: true,
  imports: [CommonModule, NavBarComponent, RouterModule],
  templateUrl: './unity-plan-main.component.html',
  styleUrl: './unity-plan-main.component.scss'
})
export class UnityPlanMainComponent {
  dayOfYear: number
  todaysReading: string
  yearPlan: Heading[]
  books: string[] = []
  dates = DATES
  biblesService: BiblesService = inject(BiblesService);
  constructor(private route: ActivatedRoute, private viewportScroller: ViewportScroller) {
    const today = new Date()
    this.books = this.biblesService.getBooksFor("NASB")
    this.dayOfYear = this.getDayOfYear(today)
    if(this.dayOfYear === -1) {
      this.todaysReading = "Leap Day"
    }
    else {
      const heading: Heading = YEAR_PLAN.at(this.dayOfYear)!
      if(heading.from.book === heading.to.book) {
        this.todaysReading = this.books.at(heading.from.book) + " " + (heading.from.chapter + 1) + ":"
          + (heading.from.verse + 1) + " - " + (heading.to.chapter + 1) + ":" + (heading.to.verse + 1)
      }
      else {
        this.todaysReading = this.books.at(heading.from.book) + " " + (heading.from.chapter + 1) + ":"
          + (heading.from.verse + 1) + " - " + this.books.at(heading.to.book) + " " + (heading.to.chapter + 1)
          + ":" + (heading.to.verse + 1)
      }
    }
    this.yearPlan = YEAR_PLAN
  }

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

  // excludes leap years
  private getDayOfYear(today: Date): number {
    if(today.getMonth() === 1 && today.getDate() === 29)
      return -1;
    today = new Date(2020, today.getMonth(), today.getDate())
    let days = 0
    const start = new Date(2020, 0, 1)
    let startMonth = start.getMonth()
    if(startMonth !== today.getMonth()) {
      while(startMonth !== today.getMonth()) {
        days += this.totalDaysOfMonth(startMonth)
        startMonth++
      }
      days += today.getDate() - 1
    }
    else {
      days += today.getDate() - start.getDate()
    }
    return days
  }

  // The months which have 31 days are January, March, May, July, August, October, and December. The months which have 30 days are April, June, September, and November.
  private totalDaysOfMonth(date: Date | number): number {
    let month
    if(date instanceof Date)
      month = date.getMonth()
    else
      month = date
    if(month === 1)
      return 28
    const thirty = [3,5,8,10]
    for(let n of thirty)
      if(month === n)
        return 30
    return 31
  }
  downloadPlan() {
    let csvData = ["Date,Reading"]
    for(let i = 0; i < YEAR_PLAN.length; i++) {
      let heading = YEAR_PLAN.at(i)!
      let dateParts = DATES.at(i)!
      let date = dateParts.month + " " + dateParts.day + dateParts.daySuffix
      let reading;
      if(heading.from.book === heading.to.book) {
        reading = this.books.at(heading.from.book) + " " + (heading.from.chapter + 1) + ":"
          + (heading.from.verse + 1) + " - " + (heading.to.chapter + 1) + ":" + (heading.to.verse + 1)
      }
      else {
        reading = this.books.at(heading.from.book) + " " + (heading.from.chapter + 1) + ":"
          + (heading.from.verse + 1) + " - " + this.books.at(heading.to.book) + " " + (heading.to.chapter + 1)
          + ":" + (heading.to.verse + 1)
      }
      csvData.push(date + "," + reading)
    }
    const blob = new Blob([csvData.join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'unity-in-reading.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

