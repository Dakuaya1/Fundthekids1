import {
  mockVolunteerData,
  type MockVolunteerChild,
} from '@/data/mockVolunteerData';

const MOCK_VOLUNTEER_ID = 'volunteer1';

export function getVolunteerTasks(): MockVolunteerChild[] {
  return (
    mockVolunteerData.find(
      (volunteer) => volunteer.volunteerId === MOCK_VOLUNTEER_ID,
    )?.children ?? []
  );
}
