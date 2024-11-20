import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SessionStorageService } from '../services/session-storage/session-storage.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {
  sessionStorage: SessionStorageService = inject(SessionStorageService)
  isSideNavOpen: string
  constructor() {
    let isOpen = sessionStorage.getItem("isSideNavOpen")
    if(isOpen === null) {
      this.isSideNavOpen = "false"
      sessionStorage.setItem("isSideNavOpen", this.isSideNavOpen)
    }
    else {
      this.isSideNavOpen = isOpen
    }
  }
  
  openCloseNav() {
    if(sessionStorage.getItem("isSideNavOpen") === "true")
      this.isSideNavOpen = "false"
    else
      this.isSideNavOpen = "true"
    sessionStorage.setItem("isSideNavOpen", this.isSideNavOpen)
  }
}
