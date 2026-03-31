import { mockGuardianData, type MockGuardianChild } from '@/data/mockGuardianData';

export type ProgressState = 'completed' | 'in-progress' | 'pending';

export function getGuardianChildren(guardianId: string): MockGuardianChild[] {
  return (
    mockGuardianData.find((guardian) => guardian.guardianId === guardianId)
      ?.children ?? []
  );
}

export function getStatusMeta(state: ProgressState) {
  if (state === 'completed') {
    return {
      label: 'Completed',
      icon: '✅',
      className:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    };
  }

  if (state === 'in-progress') {
    return {
      label: 'In Progress',
      icon: '⏳',
      className:
        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    };
  }

  return {
    label: 'Pending',
    icon: '❌',
    className:
      'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  };
}

export function getEducationState(
  child: MockGuardianChild,
  field: keyof MockGuardianChild['education'],
): ProgressState {
  if (child.education[field]) return 'completed';

  if (field === 'feesPaid' && child.education.schoolFinalized) return 'in-progress';
  if (field === 'attending' && child.education.feesPaid) return 'in-progress';

  return 'pending';
}

export function getLodgingState(
  child: MockGuardianChild,
  field: keyof MockGuardianChild['lodging'],
): ProgressState {
  if (child.lodging[field]) return 'completed';
  if (field === 'active' && child.lodging.assigned) return 'in-progress';
  return 'pending';
}

export function getSportsState(
  child: MockGuardianChild,
  field: keyof MockGuardianChild['sports'],
): ProgressState {
  if (field === 'academy') {
    if (child.sports.academy) return 'completed';
    if (child.sports.enrolled) return 'in-progress';
    return 'pending';
  }

  if (child.sports[field]) return 'completed';
  return 'pending';
}
