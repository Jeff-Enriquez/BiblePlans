import { Injectable } from '@angular/core';
import { Bible } from '../../interfaces/bible';
import { BIBLES } from './bibles';
@Injectable({
  providedIn: 'root'
})
export class BiblesService {
  getBibles(): Bible[] {
    return BIBLES;
  }
}