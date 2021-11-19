import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Publisher, Publishers } from './interfaces/publishers'; 
const baseUrl = "http://localhost:3005/publisher";
@Injectable({
  providedIn: 'root'
})
export class PublisherService {

  constructor(private http: HttpClient) { }
  getAllPublishers(){
      return this.http.get<Publishers>(baseUrl);
  }
}
