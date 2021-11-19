import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BookListComponent } from './book-list/book-list.component';
import { HoldListComponent } from './hold-list/hold-list.component';
import { SidebarFilterComponent } from './sidebar-filter/sidebar-filter.component';

@NgModule({
  declarations: [
    AppComponent,
    BookListComponent,
    HoldListComponent,
    SidebarFilterComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
