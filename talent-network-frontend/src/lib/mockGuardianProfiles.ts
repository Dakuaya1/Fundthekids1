import { mockGuardianData } from '@/data/mockGuardianData';

export interface MockGalleryChild {
  id: string;
  name: string;
  dob: string;
  talentCategory: string;
  status: 'VERIFIED';
  city: string;
  location: string;
  pleaVideoUrl?: string;
  mediaUrls: string[];
  ngo: { name: string; region: string };
  isMockProfile: true;
}

const guardianMedia: Record<string, string[]> = {
  'child-101': [
    'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80',
  ],
  'child-102': [
    'https://images.unsplash.com/photo-1486286701208-1d58e9338013?auto=format&fit=crop&w=900&q=80',
  ],
  'child-103': [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80',
  ],
};

function ageToDob(age: number) {
  const year = new Date().getFullYear() - age;
  return new Date(Date.UTC(year, 5, 15)).toISOString();
}

export function getGuardianGalleryChildren(): MockGalleryChild[] {
  return mockGuardianData
    .flatMap((guardian) => guardian.children)
    .map((child, index) => ({
      id: child.id,
      name: child.name,
      dob: ageToDob(child.age),
      talentCategory: child.talent,
      status: 'VERIFIED' as const,
      city: 'Mumbai',
      location: ['Andheri', 'Powai', 'Bandra'][index % 3],
      ngo: {
        name: 'Guardian Demo Foundation',
        region: 'Mumbai',
      },
      mediaUrls: guardianMedia[child.id] ?? [],
      isMockProfile: true as const,
    }));
}

export function mergeChildrenWithGuardianProfiles<T extends { id: string }>(
  children: T[],
  mockChildren: MockGalleryChild[],
) {
  const seen = new Set(children.map((child) => child.id));
  return [...children, ...mockChildren.filter((child) => !seen.has(child.id))];
}
