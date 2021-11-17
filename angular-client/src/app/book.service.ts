import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Book, Books } from './interfaces/books'; 
const baseUrl = "http://localhost:3005/book";
@Injectable({
  providedIn: 'root'
})
export class BookService {

    constructor(private http: HttpClient) { }
    getAllBooks(){
        return this.http.get<Books>(baseUrl);
    }
}
