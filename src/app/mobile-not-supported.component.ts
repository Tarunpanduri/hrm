import { Component } from '@angular/core';

@Component({
  selector: 'app-mobile-not-supported',
  standalone: false,
  styleUrls: ['./mobile-not-supported.component.css'],
  template: `
    <div style="text-align:center; padding: 50px;">
      <h2>⚠️ Mobile Access Blocked</h2>
      <p>This application is not supported on mobile devices or small tablets.</p>
      <p class="pp">Please access this on a desktop or larger tablet.</p>
    </div>
  `
})
export class MobileNotSupportedComponent {}
