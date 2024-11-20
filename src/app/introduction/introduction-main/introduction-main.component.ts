import { Component } from '@angular/core';
import { NavBarComponent } from "../../nav-bar/nav-bar.component";

@Component({
  selector: 'app-introduction-main',
  standalone: true,
  imports: [NavBarComponent],
  templateUrl: './introduction-main.component.html',
  styleUrl: './introduction-main.component.scss'
})
export class IntroductionMainComponent {

}
