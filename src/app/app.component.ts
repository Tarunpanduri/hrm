import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'hrm';
  private mediaQueryListener: any;

  constructor(private router: Router) {}

  ngOnInit() {
    // Check device when component is initialized
    this.checkDevice();

    // Set up media query listener for screen width changes
    this.mediaQueryListener = window.matchMedia("(max-width: 991px)");
    this.mediaQueryListener.addEventListener("change", this.checkDevice.bind(this));  // Recheck device when screen changes
  }

  ngOnDestroy() {
    // Clean up media query listener on destroy to prevent memory leaks
    if (this.mediaQueryListener) {
      this.mediaQueryListener.removeEventListener("change", this.checkDevice.bind(this));
    }
  }

  // Check if the device is mobile or small tablet
  checkDevice() {
    const isMobileOrSmallTablet = this.isMobileOrSmallTablet();
    if (isMobileOrSmallTablet) {
      this.router.navigate(['/mobile-not-supported']);  // Redirect to mobile-not-supported page
    } else {
      this.router.navigate(['/']);  // Redirect back to home if not mobile or small tablet
    }
  }

  // Check if the device is mobile or small tablet
  isMobileOrSmallTablet(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();

    // Checks for devices commonly identified as mobile/tablets
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isSmallScreen = window.innerWidth <= 991; // Adjust breakpoint for small tablets

    return isMobile || isSmallScreen;  // Returns true if mobile or small screen
  }
}




// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   standalone: false,
//   styleUrl: './app.component.css'
// })
// export class AppComponent {
//   title = 'hrm';
// }
