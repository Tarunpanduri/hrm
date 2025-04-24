

// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-root',
//   standalone:false,
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent implements OnInit, OnDestroy {
//   title = 'hrm';
//   private mediaQueryListener: any;

//   constructor(private router: Router) {}

//   ngOnInit() {
//     this.checkDevice();
//     this.mediaQueryListener = window.matchMedia("(max-width: 991px)");
//     this.mediaQueryListener.addEventListener("change", this.checkDevice.bind(this));
//   }

//   ngOnDestroy() {
//     // Clean up listener when the component is destroyed
//     if (this.mediaQueryListener) {
//       this.mediaQueryListener.removeEventListener("change", this.checkDevice);
//     }
//   }

//   // Check if the device is mobile or small tablet
//   checkDevice() {
//     const isMobileOrSmallTablet = this.isMobileOrSmallTablet();
//     if (isMobileOrSmallTablet) {
//       this.router.navigate(['/mobile-not-supported']);
//     }
//   }

//   // Check if the device is mobile or small tablet
//   isMobileOrSmallTablet(): boolean {
//     const userAgent = navigator.userAgent.toLowerCase();

//     // Checks for devices commonly identified as mobile/tablets
//     const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
//     const isSmallScreen = window.innerWidth <= 991; // Can adjust width for small tablets

//     return isMobile || isSmallScreen;
//   }
// }



import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'hrm';
}
