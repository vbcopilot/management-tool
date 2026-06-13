import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainerFacadeService } from '../../../members/services/trainer-facade.service';
import { TrainerPayment } from '../../../members/models/trainer.model';

@Component({
  selector: 'app-trainer-dues',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trainer-dues.component.html',
  styleUrls: ['./trainer-dues.component.css'],
})
export class TrainerDuesComponent implements OnInit {
  trainerId!: number;
  trainerName = '';
  payments: TrainerPayment[] = [];

  isLoading = true;
  hasChanges = false;
  isSaving = false;

  readonly paymentModes = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Other'];
  readonly statuses = ['Paid', 'Partial', 'Pending', 'Advance'];

  // tracks which row is in edit mode
  editingId: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly trainerFacade: TrainerFacadeService
  ) {}

  async ngOnInit(): Promise<void> {
    this.trainerId = Number(this.route.snapshot.paramMap.get('id'));
    const trainer = await this.trainerFacade.getTrainerById(this.trainerId);

    this.trainerName = trainer?.name ?? '';
    this.payments = (trainer?.paymentHistory ?? [])
      .slice()
      .sort(
        (a, b) =>
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      );

    this.isLoading = false;
  }

  // ── Computed summaries ────────────────────────────────────────────────────

  get totalPaid(): number {
    return this.payments
      .filter((p) => p.status === 'Paid' || p.status === 'Partial')
      .reduce((sum, p) => sum + (p.netAmount || 0), 0);
  }

  get totalPending(): number {
    return this.payments
      .filter((p) => p.status === 'Pending')
      .reduce((sum, p) => sum + (p.netAmount || 0), 0);
  }

  get totalAdvance(): number {
    return this.payments
      .filter((p) => p.status === 'Advance')
      .reduce((sum, p) => sum + (p.netAmount || 0), 0);
  }

  // ── Row actions ───────────────────────────────────────────────────────────

  addPayment(): void {
    const newPayment: TrainerPayment = {
      id: crypto.randomUUID(),
      paymentDate: new Date().toISOString().split('T')[0],
      amount: 0,
      paymentMode: 'Cash',
      status: 'Pending',
      sessionsCount: null,
      bonus: 0,
      deduction: 0,
      netAmount: 0,
      trainerNotes: '',
      adminNotes: '',
    };
    this.payments.unshift(newPayment);
    this.editingId = newPayment.id;
    this.hasChanges = true;
  }

  editRow(payment: TrainerPayment): void {
    this.editingId = payment.id;
  }

  doneRow(payment: TrainerPayment): void {
    this.recompute(payment);
    this.editingId = null;
  }

  deleteRow(payment: TrainerPayment): void {
    this.payments = this.payments.filter((p) => p.id !== payment.id);
    this.hasChanges = true;
  }

  recompute(payment: TrainerPayment): void {
    payment.netAmount =
      (payment.amount || 0) + (payment.bonus || 0) - (payment.deduction || 0);
    this.hasChanges = true;
  }

  isEditing(payment: TrainerPayment): boolean {
    return this.editingId === payment.id;
  }

  // ── Save / Cancel ─────────────────────────────────────────────────────────

  async onSave(): Promise<void> {
    if (this.editingId) {
      const current = this.payments.find((p) => p.id === this.editingId);
      if (current) this.recompute(current);
      this.editingId = null;
    }

    this.isSaving = true;
    try {
      await this.trainerFacade.updateTrainerPayments(
        this.trainerId,
        this.payments
      );
      this.hasChanges = false;
    } catch (err) {
      console.error('Failed to save payments', err);
    } finally {
      this.isSaving = false;
    }
    this.onCancel();
  }

  onCancel(): void {
    this.router.navigate(['/trainers']);
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Paid: 'tag--paid',
      Partial: 'tag--partial',
      Pending: 'tag--pending',
      Advance: 'tag--advance',
    };
    return map[status] ?? '';
  }
}
