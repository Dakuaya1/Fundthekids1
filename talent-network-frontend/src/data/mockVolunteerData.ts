export interface MockVolunteerReport {
  id: string;
  description: string;
  date: string;
  validationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface MockVolunteerChild {
  id: string;
  name: string;
  status: 'PENDING' | 'VERIFIED';
  ngo: { name: string; region: string };
  reports: MockVolunteerReport[];
}

export interface MockVolunteerRecord {
  volunteerId: string;
  region: string;
  children: MockVolunteerChild[];
}

export const mockVolunteerData: MockVolunteerRecord[] = [
  {
    volunteerId: 'volunteer1',
    region: 'Mumbai',
    children: [
      {
        id: 'vol-child-101',
        name: 'Aarav Kumar',
        status: 'VERIFIED',
        ngo: { name: 'Guardian Demo Foundation', region: 'Mumbai' },
        reports: [
          {
            id: 'vol-report-101',
            description:
              'Visited the football academy. Aarav has started training trials and needs final attendance validation before the next sponsor update.',
            date: '2026-03-28T10:30:00.000Z',
            validationStatus: 'PENDING',
          },
        ],
      },
      {
        id: 'vol-child-102',
        name: 'Meera Joshi',
        status: 'PENDING',
        ngo: { name: 'Rise Up NGO', region: 'Mumbai' },
        reports: [
          {
            id: 'vol-report-102',
            description:
              'School shortlist has been prepared and lodging has been identified. Waiting for field review to publish the next progress update.',
            date: '2026-03-30T08:15:00.000Z',
            validationStatus: 'PENDING',
          },
          {
            id: 'vol-report-103',
            description:
              'Athletics coach confirmed strong performance metrics and requested one more site visit for verification.',
            date: '2026-03-31T12:00:00.000Z',
            validationStatus: 'PENDING',
          },
        ],
      },
      {
        id: 'vol-child-103',
        name: 'Kabir Singh',
        status: 'VERIFIED',
        ngo: { name: 'Future Champions Trust', region: 'Mumbai' },
        reports: [
          {
            id: 'vol-report-104',
            description:
              'Cricket equipment delivered and first coaching session completed. Guardian asked for a final field confirmation.',
            date: '2026-03-29T16:45:00.000Z',
            validationStatus: 'PENDING',
          },
        ],
      },
    ],
  },
];
