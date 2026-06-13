import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MemberFacadeService } from '../../../members/services/member-facade.service';

export interface Member {
  id: number;
  name: string;
  goal: string;
  trainerRating?: number | null;
  assigned: boolean;
}

@Component({
  selector: 'app-assign-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-assignment.component.html',
  styleUrls: ['./member-assignment-page.component.css'],
})
export class AssignMembersComponent implements OnInit {
  @Input() members: Member[] = [
    {
      id: 1,
      name: 'Anita Sharma',
      goal: 'Weight loss',
      trainerRating: 4.8,
      assigned: true,
    },
    {
      id: 2,
      name: 'Rohan Verma',
      goal: 'Muscle gain',
      trainerRating: 4.5,
      assigned: true,
    },
    {
      id: 3,
      name: 'Priya Nair',
      goal: 'Flexibility',
      trainerRating: 4.2,
      assigned: true,
    },
    {
      id: 4,
      name: 'Karan Mehta',
      goal: 'Endurance',
      trainerRating: 3.9,
      assigned: true,
    },
    {
      id: 5,
      name: 'Sneha Iyer',
      goal: 'Weight loss',
      trainerRating: null,
      assigned: false,
    },
    {
      id: 6,
      name: 'Arjun Patel',
      goal: 'Strength',
      trainerRating: null,
      assigned: false,
    },
    {
      id: 7,
      name: 'Divya Rao',
      goal: 'Cardio fitness',
      trainerRating: null,
      assigned: false,
    },
    {
      id: 8,
      name: 'Vikram Singh',
      goal: 'Muscle gain',
      trainerRating: null,
      assigned: false,
    },
    {
      id: 9,
      name: 'Meera Joshi',
      goal: 'Flexibility',
      trainerRating: null,
      assigned: false,
    },
  ];

  constructor(
    private router: Router,
    private memberfacade: MemberFacadeService
  ) {}

  searchQuery = '';
  checkedIds = new Set<number>();
  savedIds = new Set<number>();
  hasChanges = false;
  saveSuccess = false;

  ngOnInit(): void {
    this.members
      .filter((m) => m.assigned)
      .forEach((m) => {
        this.checkedIds.add(m.id);
        this.savedIds.add(m.id);
      });
  }

  // async ngOnInit(): Promise<void> {
  //   this.memberfacade.members$.subscribe((members) => {
  //     this.members = members;
  //   });

  //   await this.memberfacade.loadMembers();
  // }

  async fetchMembers() {
    return await this.memberfacade.loadMembers();
  }

  get filteredMembers(): Member[] {
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.members;
    return this.members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) || m.goal.toLowerCase().includes(q)
    );
  }

  get assignedMembers(): Member[] {
    return this.filteredMembers.filter((m) => this.checkedIds.has(m.id));
  }

  get availableMembers(): Member[] {
    return this.filteredMembers.filter((m) => !this.checkedIds.has(m.id));
  }

  get assignedCount(): number {
    return this.checkedIds.size;
  }

  isChecked(member: Member): boolean {
    return this.checkedIds.has(member.id);
  }

  onToggle(member: Member, checked: boolean): void {
    if (checked) {
      this.checkedIds.add(member.id);
    } else {
      this.checkedIds.delete(member.id);
    }
    this.checkedIds = new Set(this.checkedIds); // trigger change detection
    this.updateChangeState();
  }

  private updateChangeState(): void {
    const same =
      this.checkedIds.size === this.savedIds.size &&
      [...this.checkedIds].every((id) => this.savedIds.has(id));
    this.hasChanges = !same;
    this.saveSuccess = false;
  }

  onSave(): void {
    this.savedIds = new Set(this.checkedIds);
    this.hasChanges = false;
    this.saveSuccess = true;
    // Emit or call your service here:
    // this.assignmentService.save([...this.savedIds]);
    this.onCancel();
  }

  onCancel(): void {
    this.router.navigate(['/trainers']);
  }
}
