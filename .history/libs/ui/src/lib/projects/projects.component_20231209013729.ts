import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsService } from '../projects.service';
import { Observable } from 'rxjs';
import { Project } from '@prisma/client';
import { AddProjectComponent } from './components/add-project.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { map } from 'rxjs/operators';



@Component({
  selector: 'monorepo-take-home-test-projects',
  standalone: true,
  imports: [CommonModule,
           AddProjectComponent,
           MatCardModule,
           MatButtonModule,
           MatGridListModule,
           MatIconModule
          ],
  
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent implements OnInit {
  public $projects: Observable<Project[]> = new Observable<Project[]>();
  imageUrl =
    'https://www.excelway.co/wp-content/uploads/2021/03/logo-color-h.svg';

  constructor(public projectsService: ProjectsService) {}

  ngOnInit(): void {
    this.$projects = this.projectsService.getAllProjects();
  }

  delete = (id: string): void => {
    this.projectsService.deleteProject(id).pipe(
      catchError((error) => {
        console.error('Error deleting project:', error);
        return throwError(error); // Rethrow the error for further handling if needed
      })
    ).subscribe(deletedProject => {
      console.log('deleted project => ', deletedProject);

      // Remove the deleted project from the observable data
      this.$projects = this.$projects.pipe(
        map(projects => projects.filter(project => project.id !== id))
      );
    });
  }
}