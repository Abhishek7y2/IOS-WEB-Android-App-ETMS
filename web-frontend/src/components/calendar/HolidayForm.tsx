import React, { useState } from 'react';
import { HolidayType, HolidayStatus } from '../../types/holiday';

interface Props {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export const HolidayForm: React.FC<Props> = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    holidayName: initialData?.holidayName || '',
    holidayDate: initialData?.holidayDate ? new Date(initialData.holidayDate).toISOString().split('T')[0] : '',
    holidayType: initialData?.holidayType || 'National Holiday',
    description: initialData?.description || '',
    location: initialData?.location || '',
    department: initialData?.department || '',
    isOptional: initialData?.isOptional || false,
    isRecurring: initialData?.isRecurring || false,
    recurrenceType: initialData?.recurrenceType || 'Yearly',
    status: initialData?.status || 'Upcoming'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.holidayName || formData.holidayName.length < 3 || formData.holidayName.length > 100) {
      newErrors.holidayName = 'Name must be between 3 and 100 characters';
    }
    if (!formData.holidayDate) {
      newErrors.holidayDate = 'Date is required';
    }
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      await onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Holiday Name *
          </label>
          <input
            type="text"
            name="holidayName"
            value={formData.holidayName}
            onChange={handleChange}
            className={`w-full p-2.5 rounded-lg border bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none transition-colors ${errors.holidayName ? 'border-red-500 focus:border-red-500' : 'border-zinc-300 dark:border-zinc-700 focus:border-blue-500'}`}
            placeholder="e.g. Independence Day"
          />
          {errors.holidayName && <p className="text-red-500 text-xs mt-1">{errors.holidayName}</p>}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Holiday Date *
          </label>
          <input
            type="date"
            name="holidayDate"
            value={formData.holidayDate}
            onChange={handleChange}
            className={`w-full p-2.5 rounded-lg border bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none transition-colors ${errors.holidayDate ? 'border-red-500 focus:border-red-500' : 'border-zinc-300 dark:border-zinc-700 focus:border-blue-500'}`}
          />
          {errors.holidayDate && <p className="text-red-500 text-xs mt-1">{errors.holidayDate}</p>}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Holiday Type *
          </label>
          <select
            name="holidayType"
            value={formData.holidayType}
            onChange={handleChange}
            className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 transition-colors"
          >
            <option value="National Holiday">National Holiday</option>
            <option value="Festival Holiday">Festival Holiday</option>
            <option value="Company Holiday">Company Holiday</option>
            <option value="Regional Holiday">Regional Holiday</option>
            <option value="Optional Holiday">Optional Holiday</option>
            <option value="Restricted Holiday">Restricted Holiday</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Status *
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 transition-colors"
          >
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 transition-colors"
            placeholder="e.g. New York Office"
          />
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Department
          </label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500 transition-colors"
            placeholder="e.g. Engineering"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-8">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="isOptional"
            checked={formData.isOptional}
            onChange={handleChange}
            className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Optional Holiday</span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="isRecurring"
            checked={formData.isRecurring}
            onChange={handleChange}
            className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Yearly Recurring</span>
        </label>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className={`w-full p-2.5 rounded-lg border bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none transition-colors resize-none ${errors.description ? 'border-red-500 focus:border-red-500' : 'border-zinc-300 dark:border-zinc-700 focus:border-blue-500'}`}
          placeholder="Add any additional details..."
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 font-medium rounded-lg text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {loading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {initialData ? 'Update Holiday' : 'Add Holiday'}
        </button>
      </div>
    </form>
  );
};
