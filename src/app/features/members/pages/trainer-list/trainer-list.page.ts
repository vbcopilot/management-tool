import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trainer-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      style="padding: 24px; font-family: sans-serif; color: #333; max-width: 400px;"
    >
      <div
        style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;"
      >
        <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600;">
          Trainers
        </h2>
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
          Feature Coming Soon
        </span>
      </div>

      <p
        style="color: #6b7280; font-size: 0.9rem; margin-bottom: 24px; line-height: 1.5;"
      >
        We are putting together a team of world-class instructors. Here is a
        sneak peek at who is joining us shortly.
      </p>

      <ul style="list-style: none; padding: 0; margin: 0;">
        @for (trainer of trainers; track trainer.id) {
        <li
          style="
            padding: 12px 0; 
            border-bottom: 1px solid #f3f4f6;
            display: flex;
            flex-direction: column;
            gap: 4px;
          "
        >
          <span style="font-weight: 500; color: #111827;">{{
            trainer.name
          }}</span>
          <span style="font-size: 0.85rem; color: #9ca3af;">{{
            trainer.specialty
          }}</span>
        </li>
        }
      </ul>
    </div>
  `,
})
export class TrainerListPage {
  trainers = [
    { id: 1, name: 'John Doe', specialty: 'Strength Training' },
    { id: 2, name: 'Jane Smith', specialty: 'Cardio Fitness' },
    { id: 3, name: 'Mike Johnson', specialty: 'Yoga and Flexibility' },
  ];
}
