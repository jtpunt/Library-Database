import { Component, OnInit } from '@angular/core';
import { AuthorService } from '../author.service';
import { PublisherService } from '../publisher.service';
import { GenreService } from '../genre.service';
@Component({
  selector: 'app-sidebar-filter',
  templateUrl: './sidebar-filter.component.html',
  styleUrls: ['./sidebar-filter.component.sass']
})
export class SidebarFilterComponent implements OnInit {
  publishers: any;
  authors: any;
  genres: any;
  constructor(
    private authorService: AuthorService,
    private publisherService: PublisherService,
    private genreService: GenreService
  ) { }

  ngOnInit(): void {
      this.authorService.getAllBooks().subscribe(
          data => {
              console.log(data);
       
              this.authors = data;
          },
          error => {
              console.log("ERROR: " + error);
          }
      );
      this.publisherService.getAllPublishers().subscribe(
          data => {
              console.log(data);
       
              this.publishers = data;
          },
          error => {
              console.log("ERROR: " + error);
          }
      );
      this.genreService.getAllGenres().subscribe(
          data => {
              console.log(data);
       
              this.genres = data;
          },
          error => {
              console.log("ERROR: " + error);
          }
      );
  }

}
