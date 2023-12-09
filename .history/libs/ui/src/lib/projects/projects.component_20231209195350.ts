import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { RouterLink, RouterOutlet } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsService } from '../projects.service';
import { Observable, throwError } from 'rxjs';
import { Project } from '@prisma/client';
import { catchError, map, take } from 'rxjs/operators';
import Swal from 'sweetalert2'
import { AddProjectComponent } from './components/add-project/add-project.component';
import { EditProjectComponent } from './components/edit-project/edit-project.component';
import { EditProjectService } from './services/edit-project.service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';



@Component({
  selector: 'monorepo-take-home-test-projects',
  standalone: true,
  imports: [
    CommonModule,
    AddProjectComponent,
    EditProjectComponent,
    RouterLink,
    RouterOutlet,
    DragDropModule,
    MatCardModule,
    MatButtonModule,
  ],
  
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent implements OnInit {
  public $projects: Observable<Project[]> = new Observable<Project[]>();
  public projects: Project[] = []
  filteredProjects!: Observable<Project[]>;
  
  imageUrl =
    'https://www.excelway.co/wp-content/uploads/2021/03/logo-color-h.svg';

  constructor(public projectsService: ProjectsService, private _editProjectService: EditProjectService) {}

  ngOnInit(): void {
   this.loadProjects()
    this.$projects.subscribe(prj => {
      this.projects = prj
    })
  }

  loadProjects = () => {
    this.$projects = this.projectsService.getAllProjects();
  }

  delete = (id: string): void => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.projectsService.deleteProject(id).pipe(
          catchError((error) => {
            console.error('Error deleting project:', error);
            // Rethrow the error for further handling if needed
            return throwError(error);
          })
        ).subscribe(deletedProject => {
          console.log('deleted project => ', deletedProject);
    
          // Remove the deleted project from the observable data
          this.$projects = this.$projects.pipe(
            map(projects => projects.filter(project => project.id !== id))
          );
        });
        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success"
        });
      }
    });   
  }

  // onDrop(event: CdkDragDrop<Project[]>): void {
  //   // Your existing logic for reordering projects...
    
  //   // Assuming you have access to the projects involved in the drop
  //   const projectId1 = this.projects[event.previousIndex].id;
  //   const order1 = event.previousIndex + 1; // Adding 1 to match backend's 1-based indexing
  //   const projectId2 = this.projects[event.currentIndex].id;
  //   const order2 = event.currentIndex + 1; // Adding 1 to match backend's 1-based indexing

  //   // Call the service method to update order between projects
  //   this.projectsService.updateOrderBetweenProjects(projectId1, order1, projectId2, order2)
  //     .pipe(
  //       catchError(error => {
  //         console.error('Error updating order between projects:', error);
  //         // Handle error as needed
  //         return [];
  //       })
  //     )
  //     .subscribe(() => {
  //       // Handle success response if needed
  //       console.log('Order between projects updated successfully.');
  //       this.loadProjects()
  //     });
  // }

  onDrop(event: CdkDragDrop<Project>): void {
    // Rearranging projects logic here...

    const projectId1 = this.projects[event.previousIndex].id;
    const order1 = event.previousIndex; // Assuming the backend uses 0-based indexing
    const projectId2 = this.projects[event.currentIndex].id;
    const order2 = event.currentIndex; // Assuming the backend uses 0-based indexing

    this.projectsService.updateOrderBetweenProjects(projectId1, order1, projectId2, order2)
      .pipe(
        catchError(error => {
          console.error('Error updating order between projects:', error);
          return [];
        })
      )
      .subscribe(() => {
       // console.log('Order between projects updated successfully.');
        this.loadProjects();
      });
  }
}