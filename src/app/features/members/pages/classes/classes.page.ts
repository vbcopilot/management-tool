import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      style="padding: 24px; font-family: sans-serif; color: #333; max-width: 500px;"
    >
      <div
        style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;"
      >
        <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600;">Classes</h2>
        <span
          style="
          background-color: #f3f4f6; 
          color: #6b7280; 
          font-size: 0.75rem; 
          font-weight: 500; 
          padding: 4px 8px; 
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        "
        >
          Coming Soon
        </span>
      </div>

      <p
        style="color: #6b7280; font-size: 0.9rem; margin-bottom: 24px; line-height: 1.5;"
      >
        Our interactive class booking system and weekly schedules are currently
        being finalized. Take a look at our upcoming lineup.
      </p>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        @for (classItem of mockClasses; track classItem.name) {
        <div
          style="
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            padding: 14px 16px; 
            border: 1px solid #f3f4f6; 
            border-radius: 6px;
            background-color: #fafafa;
          "
        >
          <div>
            <span
              style="display: block; font-weight: 500; color: #4b5563; font-size: 0.95rem;"
            >
              {{ classItem.name }}
            </span>
            <span
              style="display: block; font-size: 0.8rem; color: #9ca3af; margin-top: 2px;"
            >
              {{ classItem.duration }}
            </span>
          </div>

          <span
            style="
              font-size: 0.8rem; 
              color: #9ca3af; 
              font-weight: 500;
              background: #ffffff;
              padding: 4px 8px;
              border-radius: 4px;
              border: 1px solid #e5e7eb;
            "
          >
            {{ classItem.time }}
          </span>
        </div>
        }
      </div>
    </div>
  `,
})
export class ClassesPage {
  // Mock data structure to keep the UI elegant while in a pending state
  mockClasses = [
    {
      name: 'HIIT Circuit',
      duration: '45 mins • High Intensity',
      time: '--:--',
    },
    {
      name: 'Vinyasa Flow Yoga',
      duration: '60 mins • Mindfulness',
      time: '--:--',
    },
    {
      name: 'Power Lifting Basics',
      duration: '50 mins • Strength',
      time: '--:--',
    },
  ];
}
