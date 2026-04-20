export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  description?: string;
  type: 'primary' | 'secondary' | 'tertiary';
  date: string; // ISO string or specific date format
}

export const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Design Sync',
    time: '10:00 AM',
    description: 'Review the latest designs with the product team.',
    type: 'primary',
    date: '2023-09-15',
  },
  {
    id: '2',
    title: 'Project Review',
    time: '2:30 PM',
    description: 'Quarterly review of current project progress.',
    type: 'tertiary',
    date: '2023-09-15',
  },
  {
    id: '3',
    title: 'Weekly Sync',
    time: '4:00 PM',
    type: 'secondary',
    date: '2023-09-11',
  },
  {
    id: '4',
    title: 'Deep Work',
    time: '9:00 AM',
    type: 'primary',
    date: '2023-09-13',
  },
  {
    id: '5',
    title: 'Team Coffee',
    time: '11:00 AM',
    type: 'secondary',
    date: '2023-09-04',
  },
  {
    id: '6',
    title: 'Client Call',
    time: '3:00 PM',
    type: 'tertiary',
    date: '2023-09-02',
  },
  {
    id: '7',
    title: 'Strategy Session',
    time: '10:00 AM',
    type: 'primary',
    date: '2023-09-07',
  }
];
