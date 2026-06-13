import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MemberFacadeService } from '../../../members/services/member-facade.service';
import { TrainerFacadeService } from '../../../members/services/trainer-facade.service';
import { Member } from '../../../members/models/member.model';

export interface AssignedMember {
  id: number;
  name: string;
  goal: string;
  ratingGiven: number | null;
  memberNotes: string;
  trainerNotes: string;
  isAssigned: boolean;
}

interface MemberRow {
  id: number;
  name: string;
  age: any;
  weight: any;
  height: any;
  // assignment fields
  isAssigned: boolean;
  goal: string;
  ratingGiven: number | null;
  memberNotes: string;
  trainerNotes: string;
  // UI state
  isEditing: boolean;
}

@Component({
  selector: 'app-assign-members',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-assignment.component.html',
  styleUrls: ['./member-assignment-page.component.css'],
})
export class AssignMembersComponent implements OnInit {
  trainerId!: number;
  rows: MemberRow[] = [];

  searchQuery = '';
  hasChanges = false;
  isSaving = false;
  isLoading = true;

  readonly stars = Array.from({ length: 10 }, (_, i) => i + 1);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly memberFacade: MemberFacadeService,
    private readonly trainerFacade: TrainerFacadeService
  ) {}

  async ngOnInit(): Promise<void> {
    this.trainerId = Number(this.route.snapshot.paramMap.get('id'));

    const trainer = await this.trainerFacade.getTrainerById(this.trainerId);
    const assignedMap = new Map<number, AssignedMember>(
      (trainer?.membersAssigned ?? []).map((m: AssignedMember) => [
        Number(m.id),
        m,
      ])
    );

    await this.memberFacade.loadMembers();

    this.memberFacade.members$.subscribe((members: Member[]) => {
      this.rows = members.map((m) => {
        const existing = assignedMap.get(Number(m.id));
        return {
          id: Number(m.id),
          name: m.name,
          age: m.age,
          weight: m.weight,
          height: m.height,
          isAssigned: existing?.isAssigned ?? false,
          goal: existing?.goal ?? '',
          ratingGiven: existing?.ratingGiven ?? null,
          memberNotes: existing?.memberNotes ?? '',
          trainerNotes: existing?.trainerNotes ?? '',
          isEditing: false,
        };
      });
      this.isLoading = false;
    });
  }

  // ── Filtering ──────────────────────────────────────────────────────────────

  get filteredRows(): MemberRow[] {
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.rows;
    return this.rows.filter((r) => r.name.toLowerCase().includes(q));
  }

  get assignedRows(): MemberRow[] {
    return this.filteredRows.filter((r) => r.isAssigned);
  }

  get availableRows(): MemberRow[] {
    return this.filteredRows.filter((r) => !r.isAssigned);
  }

  get assignedCount(): number {
    return this.rows.filter((r) => r.isAssigned).length;
  }

  // ── Assignment toggle ──────────────────────────────────────────────────────

  onToggle(row: MemberRow, checked: boolean): void {
    row.isAssigned = checked;
    if (!checked) row.isEditing = false;
    this.hasChanges = true;
  }

  // ── Inline edit ───────────────────────────────────────────────────────────

  toggleEdit(row: MemberRow): void {
    row.isEditing = !row.isEditing;
  }

  setRating(row: MemberRow, star: number): void {
    row.ratingGiven = star;
    this.hasChanges = true;
  }

  onFieldChange(): void {
    this.hasChanges = true;
  }

  // ── Save / Cancel ─────────────────────────────────────────────────────────

  async onSave(): Promise<void> {
    if (!this.trainerId) return;
    this.isSaving = true;

    // All members are persisted (isAssigned flag tracks active/inactive).
    // Ratings of unassigned members are still kept for average calculation.
    const payload: AssignedMember[] = this.rows.map((r) => ({
      id: r.id,
      name: r.name,
      goal: r.goal,
      ratingGiven: r.ratingGiven,
      memberNotes: r.memberNotes,
      trainerNotes: r.trainerNotes,
      isAssigned: r.isAssigned,
    }));

    try {
      await this.trainerFacade.updateTrainerAssignment(this.trainerId, payload);
      this.hasChanges = false;
      this.rows.forEach((r) => (r.isEditing = false));
    } catch (err) {
      console.error('Failed to save assignment', err);
    } finally {
      this.isSaving = false;
    }

    this.onCancel();
  }

  onCancel(): void {
    this.router.navigate(['/trainers']);
  }
}
