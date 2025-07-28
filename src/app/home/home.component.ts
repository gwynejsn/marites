import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { storeStructure } from '../app.config';
import { selectIsAuthenticated } from '../authentication/store/authentication.selectors';
import { DarkModeService } from '../shared/dark-mode.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styles: ``,
})
export class HomeComponent {
  showDarkModeDemo = computed(() => this.darkModeService.darkMode());
  isMobile = false;
  techStack = [
    {
      name: 'Angular',
      img: 'assets/stack/angular.png',
      link: 'https://angular.io/docs',
    },
    {
      name: 'Tailwind',
      img: 'assets/stack/tailwind.svg',
      link: 'https://tailwindcss.com/docs',
    },
    {
      name: 'Firebase',
      img: 'assets/stack/firebase.png',
      link: 'https://firebase.google.com/docs',
    },
    {
      name: 'Cloudinary',
      img: 'assets/stack/cloudinary.png',
      link: 'https://cloudinary.com',
    },
  ];

  constructor(
    private router: Router,
    private store$: Store<storeStructure>,
    public darkModeService: DarkModeService
  ) {
    store$.pipe(select(selectIsAuthenticated)).subscribe((isAuthenticated) => {
      if (isAuthenticated) router.navigate(['/chat-area']);
    });
  }

  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768; // md breakpoint
  }
}
