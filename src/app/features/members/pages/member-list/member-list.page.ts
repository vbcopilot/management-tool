import { Component, OnInit, inject } from '@angular/core';
import { MemberGridComponent } from '../../components/member-grid/member-grid.component';
import { Member } from '../../models/member.model';
import { MemberFacadeService } from '../../services/member-facade.service';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [MemberGridComponent],
  template: `
    <div class="page-container">
      <header class="page-header">
        <button class="add-btn" (click)="createMember()">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="btn-icon"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Member
        </button>
      </header>

      <main class="grid-content">
        <app-member-grid [members]="members"></app-member-grid>
      </main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        box-sizing: border-box;
      }

      .page-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          Helvetica, Arial, sans-serif;
      }

      .page-header {
        display: flex;
        justify-content: right;
        align-items: center;
        margin: 20px;
        border-bottom: 1px solid #eaeaea;
        padding-bottom: 12px;
        flex-shrink: 0; /* Ensures header doesn't shrink when content overflows */
      }

      .page-title {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #333;
      }

      .grid-content {
        flex: 1;
        min-height: 0; /* Crucial for internal scrollbars in flex containers */
        overflow-y: auto;
        width: 100%;
      }

      .add-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background-color: #054a91;
        color: white;
        border: none;
        padding: 8px 16px;
        font-size: 0.875rem;
        font-weight: 500;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s ease, transform 0.1s ease;
        box-shadow: 0 2px 4px rgba(5, 74, 145, 0.15);
      }

      .add-btn:hover {
        background-color: #043970;
      }

      .add-btn:active {
        transform: scale(0.98);
      }

      .btn-icon {
        width: 16px;
        height: 16px;
      }
    `,
  ],
})
export class MemberListPage implements OnInit {
  members: Member[] = [];

  constructor(private readonly facade: MemberFacadeService) {}

  async ngOnInit(): Promise<void> {
    this.facade.members$.subscribe((members) => {
      this.members = members;
    });

    await this.facade.loadMembers();
  }

  async createMember(): Promise<void> {
    const newMember: Member = {
      name: null,
      age: null,
      weight: null,
      height: null,
    };

    this.members = [newMember, ...this.members];
  }
}
