import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionStorageService } from './services/session-storage/session-storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'UnityInBibleReading';
  sessionStorage: SessionStorageService = inject(SessionStorageService)
  constructor() {
    this.sessionStorage.removeItem("isSideNavOpen")
  }
}
