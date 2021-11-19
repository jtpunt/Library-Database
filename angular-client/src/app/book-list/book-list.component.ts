import { Component, OnInit } from '@angular/core';
import { BookService } from '../book.service';
import { Author, Authors } from '../interfaces/authors'; 
import { Book, Books } from '../interfaces/books'; 
@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
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
         
                this.books = data;
            },
            error => {
                console.log("ERROR: " + error);
            }
        );
    }

}
