import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookListComponent } from './book-list/book-list.component';
import { HoldListComponent } from './hold-list/hold-list.component';
import { SidebarFilterComponent } from './sidebar-filter/sidebar-filter.component';

const routes: Routes = [
  { path: '', component: BookListComponent},
  { path: 'holds', component: HoldListComponent},
  { path: 'filter', component: SidebarFilterComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
