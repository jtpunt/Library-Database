import { Component, OnInit } from '@angular/core';
import { BookService } from '../book.service';
import { Author, Authors } from '../interfaces/authors'; 
@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.sass']
})
export class BookListComponent implements OnInit {
    authors: any;
    books: any;
    genres: any;
    holds: any;
    patrons: any;
    publishers: any;
    // constructor() { }
    constructor(private bookService: BookService) { }

    ngOnInit(): void {
        this.bookService.getAllBooks().subscribe(
            data => {
                console.log(data);
                var parsedObj = Object.keys(data);
                console.log(parsedObj);

            },
            error => {
                console.log("ERROR: " + error);
            }
        );
    }

}
