import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Author, Authors } from './interfaces/authors'; 
const baseUrl = "http://localhost:3005/author";
@Injectable({
  providedIn: 'root'
})
export class AuthorService {

  constructor(private http: HttpClient) { }
    getAllBooks(){
        return this.http.get<Authors>(baseUrl);
    }
}
