import axiosInstance from './axios';

export interface HolidayItem {
  id: string;
  title: string;
  dateStr: string;
  type: 'mandatory' | 'optional';
  description?: string;
}

export async function getHolidaysApi(): Promise<HolidayItem[]> {
  try {
    const res = await axiosInstance.get<{ success: boolean; data: any }>('/holidays');
    let rawList = res.data?.data;
    if (rawList && Array.isArray(rawList.holidays)) {
      rawList = rawList.holidays;
    }
    if (!Array.isArray(rawList)) {
      rawList = Array.isArray(res.data) ? res.data : [];
    }
    if (!Array.isArray(rawList) || rawList.length === 0) {
      throw new Error('No holidays found from API');
    }
    return rawList.map((h: any) => ({
      id: h._id || h.id || `h-${Math.random()}`,
      title: h.name || h.title || 'Company Holiday',
      dateStr: h.date || h.dateStr || new Date().toISOString().split('T')[0],
      type: h.type || 'mandatory',
      description: h.description,
    }));
  } catch {
    return [
      {
        id: 'h-1',
        title: 'New Year Day',
        dateStr: '2026-01-01',
        type: 'mandatory',
        description: 'Official National Holiday',
      },
      {
        id: 'h-2',
        title: 'Republic Day',
        dateStr: '2026-01-26',
        type: 'mandatory',
        description: 'National Public Holiday',
      },
      {
        id: 'h-3',
        title: 'Independence Day',
        dateStr: '2026-08-15',
        type: 'mandatory',
        description: 'National Public Holiday',
      },
      {
        id: 'h-4',
        title: 'Gandhi Jayanti',
        dateStr: '2026-10-02',
        type: 'mandatory',
        description: 'National Public Holiday',
      },
    ];
  }
}

export async function createHolidayApi(data: { name: string; date: string; type?: string; description?: string }): Promise<HolidayItem> {
  const res = await axiosInstance.post<{ success: boolean; data: any }>('/holidays', data);
  const h = res.data?.data || {};
  return {
    id: h._id || h.id || `h-${Date.now()}`,
    title: h.name || data.name,
    dateStr: h.date || data.date,
    type: h.type || data.type || 'mandatory',
    description: h.description || data.description,
  };
}

export async function deleteHolidayApi(id: string): Promise<boolean> {
  try {
    const res = await axiosInstance.delete<{ success: boolean }>(`/holidays/${id}`);
    return res.data?.success || true;
  } catch {
    return false;
  }
}
