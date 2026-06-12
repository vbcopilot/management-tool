import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { db } from '../../../../core/db/app-db';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-member-assignment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member-assignment.component.html',
  styleUrls: ['./member-assignment-page.component.css'],
})
export class MemberAssignmentPageComponent implements OnInit {
  trainerId!: number;
  assignedMembers: any[] = [];
  availableMembers: any[] = [];

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    this.trainerId = Number(this.route.snapshot.paramMap.get('id'));
    await this.loadData();
  }

  async loadData() {
    // 1. Get all members and trainers
    const allTrainers = await db.trainers.toArray();

    // 2. Filter logic: This assumes your 'Member' model has a 'trainerId' property
    this.assignedMembers = allTrainers.filter((m) => m.id === this.trainerId);
    this.availableMembers = allTrainers.filter((m) => m.id !== this.trainerId);
  }

  async toggleAssignment(member: any, shouldAssign: boolean) {
    // Update the member in Dexie
    await db.members.update(member.id, {
      id: shouldAssign ? this.trainerId : null,
    });

    // Refresh the local lists
    await this.loadData();
  }
}
