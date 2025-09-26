import { Component } from '@angular/core';
import { DropdownVideosComponent } from '../../shared/components/dropdown-videos/dropdown-videos.component';

@Component({
  selector: 'app-movies',
  imports: [DropdownVideosComponent],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.scss'
})
export class MoviesComponent {

}
