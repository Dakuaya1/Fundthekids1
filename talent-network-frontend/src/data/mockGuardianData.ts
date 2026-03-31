export interface MockGuardianChild {
  id: string;
  name: string;
  age: number;
  talent: string;
  education: {
    schoolFinalized: boolean;
    feesPaid: boolean;
    attending: boolean;
  };
  lodging: {
    assigned: boolean;
    active: boolean;
  };
  sports: {
    enrolled: boolean;
    academy: string | null;
  };
}

export interface MockGuardianRecord {
  guardianId: string;
  children: MockGuardianChild[];
}

export const mockGuardianData: MockGuardianRecord[] = [
  {
    guardianId: 'guardian1',
    children: [
      {
        id: 'child-101',
        name: 'Aarav Kumar',
        age: 13,
        talent: 'Football',
        education: {
          schoolFinalized: true,
          feesPaid: true,
          attending: false,
        },
        lodging: {
          assigned: true,
          active: true,
        },
        sports: {
          enrolled: true,
          academy: 'Elite Youth Football Academy',
        },
      },
      {
        id: 'child-102',
        name: 'Meera Joshi',
        age: 11,
        talent: 'Athletics',
        education: {
          schoolFinalized: true,
          feesPaid: false,
          attending: false,
        },
        lodging: {
          assigned: true,
          active: false,
        },
        sports: {
          enrolled: true,
          academy: null,
        },
      },
      {
        id: 'child-103',
        name: 'Kabir Singh',
        age: 12,
        talent: 'Cricket',
        education: {
          schoolFinalized: false,
          feesPaid: false,
          attending: false,
        },
        lodging: {
          assigned: false,
          active: false,
        },
        sports: {
          enrolled: false,
          academy: null,
        },
      },
    ],
  },
  {
    guardianId: 'guardian2',
    children: [
      {
        id: 'child-201',
        name: 'Zoya Ali',
        age: 10,
        talent: 'Swimming',
        education: {
          schoolFinalized: true,
          feesPaid: true,
          attending: true,
        },
        lodging: {
          assigned: true,
          active: true,
        },
        sports: {
          enrolled: true,
          academy: 'BlueWave Performance Center',
        },
      },
    ],
  },
];
