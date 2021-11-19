import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Genre, Genres } from './interfaces/genres'; 
const baseUrl = "http://localhost:3005/genre";
@Injectable({
  providedIn: 'root'
})
export class GenreService {

  constructor(private http: HttpClient) { }
    getAllGenres(){
      return this.http.get<Genres>(baseUrl);
  }
}
