'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Paperclip, Send, Save, Bold, Italic, Link, AtSign, AlertCircle, ChevronDown, Search, Loader2 } from 'lucide-react';
import { ComposeFormData, MessagePriority, Attachment } from '../../types/communication';
import { AttachmentPreview } from './AttachmentPreview';
import { fetchEmployees, EmployeeOption } from '../../api/communication';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: ComposeFormData, draftId?: string) => void;
  onSaveDraft: (data: ComposeFormData, draftId?: string) => void;
  isBroadcast?: boolean;
  prefill?: (Partial<ComposeFormData> & { id?: string }) | null;
}

const priorityOptions: { value: MessagePriority; label: string; activeColor: string; inactiveColor: string }[] = [
  { value: 'low', label: 'Low', activeColor: 'text-green-700 bg-green-100 border-green-300 dark:text-green-400 dark:bg-green-950/50 dark:border-green-800/50 ring-2 ring-green-500/20 shadow-sm', inactiveColor: 'text-green-600 border-green-200/60 bg-white hover:bg-green-50 dark:text-green-500 dark:border-green-900/30 dark:bg-transparent dark:hover:bg-green-950/20' },
  { value: 'medium', label: 'Medium', activeColor: 'text-blue-700 bg-blue-100 border-blue-300 dark:text-blue-400 dark:bg-blue-950/50 dark:border-blue-800/50 ring-2 ring-blue-500/20 shadow-sm', inactiveColor: 'text-blue-600 border-blue-200/60 bg-white hover:bg-blue-50 dark:text-blue-500 dark:border-blue-900/30 dark:bg-transparent dark:hover:bg-blue-950/20' },
  { value: 'high', label: 'High', activeColor: 'text-amber-700 bg-amber-100 border-amber-300 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-800/50 ring-2 ring-amber-500/20 shadow-sm', inactiveColor: 'text-amber-600 border-amber-200/60 bg-white hover:bg-amber-50 dark:text-amber-500 dark:border-amber-900/30 dark:bg-transparent dark:hover:bg-amber-950/20' },
  { value: 'urgent', label: 'Urgent', activeColor: 'text-red-700 bg-red-100 border-red-300 dark:text-red-400 dark:bg-red-950/50 dark:border-red-800/50 ring-2 ring-red-500/20 shadow-sm', inactiveColor: 'text-red-600 border-red-200/60 bg-white hover:bg-red-50 dark:text-red-500 dark:border-red-900/30 dark:bg-transparent dark:hover:bg-red-950/20' },
];

export const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose, onSend, onSaveDraft, isBroadcast, prefill }) => {
  const [form, setForm] = useState<ComposeFormData>({
    to: [],
    subject: '',
    project: '',
    relatedTaskId: '',
    priority: 'medium',
    content: '',
    attachments: [],
  });
  const [toInput, setToInput] = useState('');

  // Load prefill values
  useEffect(() => {
    if (isOpen) {
      if (prefill) {
        setForm({
          to: prefill.to || [],
          subject: prefill.subject || '',
          project: prefill.project || '',
          relatedTaskId: prefill.relatedTaskId || '',
          priority: prefill.priority || 'medium',
          content: prefill.content || '',
          attachments: prefill.attachments || [],
        });
      } else {
        setForm({
          to: [],
          subject: '',
          project: '',
          relatedTaskId: '',
          priority: 'medium',
          content: '',
          attachments: [],
        });
      }
      setErrors({});
    }
  }, [isOpen, prefill]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch employees from API
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const loadEmployees = async () => {
      setIsLoadingEmployees(true);
      try {
        const data = await fetchEmployees();
        if (!cancelled) setEmployees(data);
      } catch {
        // API unavailable — employees list stays empty, user can type manually
      } finally {
        if (!cancelled) setIsLoadingEmployees(false);
      }
    };

    loadEmployees();
    return () => { cancelled = true; };
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!isBroadcast && form.to.length === 0) newErrors.to = 'Select at least one recipient';
    if (!form.subject.trim()) newErrors.subject = 'Subject is required';
    if (!form.content.trim()) newErrors.content = 'Message content is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = () => {
    if (!validate()) return;
    onSend(form, prefill?.id);
    onClose();
  };

  const handleSaveDraft = () => {
    onSaveDraft(form, prefill?.id);
    onClose();
  };

  const handleAddAttachment = () => {
    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      name: `document-${form.attachments.length + 1}.pdf`,
      type: 'pdf',
      url: '#',
      size: Math.floor(Math.random() * 5000000) + 100000,
    };
    setForm({ ...form, attachments: [...form.attachments, newAtt] });
  };

  const handleRemoveAttachment = (id: string) => {
    setForm({ ...form, attachments: form.attachments.filter((a) => a.id !== id) });
  };

  const addRecipient = (emp: EmployeeOption) => {
    if (!form.to.includes(emp.id)) {
      setForm({ ...form, to: [...form.to, emp.id] });
    }
    setToInput('');
    setShowDropdown(false);
  };

  const addRecipientManual = () => {
    if (toInput.trim() && !form.to.includes(toInput.trim())) {
      setForm({ ...form, to: [...form.to, toInput.trim()] });
    }
    setToInput('');
  };

  const removeRecipient = (id: string) => {
    setForm({ ...form, to: form.to.filter((t) => t !== id) });
  };

  // Get selected employee details for display
  const getEmployeeName = (id: string): string => {
    const emp = employees.find((e) => e.id === id);
    return emp ? emp.name : id;
  };

  const getEmployeeAvatar = (id: string): string | undefined => {
    const emp = employees.find((e) => e.id === id);
    return emp?.profilePicture || undefined;
  };

  // Filter employees for dropdown
  const filteredEmployees = employees.filter(
    (emp) =>
      !form.to.includes(emp.id) &&
      (emp.name.toLowerCase().includes(toInput.toLowerCase()) ||
        emp.email.toLowerCase().includes(toInput.toLowerCase()) ||
        emp.designation.toLowerCase().includes(toInput.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm font-lucid">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-200/60 bg-white shadow-2xl dark:border-zinc-800/60 dark:bg-zinc-950 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 px-6 py-4">
          <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-50 font-outfit">
            {isBroadcast ? '📢 Broadcast Message' : 'Compose Message'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* To (hidden for broadcast) */}
          {!isBroadcast && (
            <div ref={dropdownRef} className="relative">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">To</label>
              <div className="mt-1 flex flex-wrap gap-1.5 rounded-xl border border-zinc-200/60 bg-zinc-50/50 px-3 py-2 dark:border-zinc-800/60 dark:bg-zinc-900/30 focus-within:border-blue-500 transition-colors">
                {form.to.map((id) => (
                  <span key={id} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                    {getEmployeeAvatar(id) && (
                      <img src={getEmployeeAvatar(id)} alt="" className="h-3.5 w-3.5 rounded-full object-cover" />
                    )}
                    {getEmployeeName(id)}
                    <button onClick={() => removeRecipient(id)} className="hover:text-red-500"><X className="h-2.5 w-2.5" /></button>
                  </span>
                ))}
                <div className="relative flex-1 min-w-[120px]">
                  <input
                    value={toInput}
                    onChange={(e) => {
                      setToInput(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (filteredEmployees.length === 1) {
                          addRecipient(filteredEmployees[0]);
                        } else if (toInput.trim()) {
                          addRecipientManual();
                        }
                      }
                      if (e.key === 'Backspace' && toInput === '' && form.to.length > 0) {
                        removeRecipient(form.to[form.to.length - 1]);
                      }
                    }}
                    placeholder={form.to.length === 0 ? 'Search employees by name, email, or role...' : ''}
                    className="w-full bg-transparent text-sm text-zinc-900 outline-none dark:text-zinc-100 placeholder:text-zinc-500"
                  />
                </div>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="rounded p-0.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Employee Dropdown */}
              {showDropdown && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-zinc-200/60 bg-white shadow-lg dark:border-zinc-800/60 dark:bg-zinc-900 max-h-48 overflow-y-auto">
                  {isLoadingEmployees ? (
                    <div className="flex items-center justify-center gap-2 px-4 py-3 text-[10px] text-zinc-500">
                      <Loader2 className="h-3 w-3 animate-spin" /> Loading employees...
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="px-4 py-3 text-[10px] text-zinc-500">
                      {employees.length === 0
                        ? 'No employees found. Enter recipient ID manually.'
                        : 'No matching employees found.'}
                    </div>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => addRecipient(emp)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        {emp.profilePicture ? (
                          <img src={emp.profilePicture} alt="" className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{emp.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{emp.designation} · {emp.email}</p>
                        </div>
                        <span className="text-[9px] font-bold uppercase text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded px-1.5 py-0.5">
                          {emp.role}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {errors.to && <p className="mt-1 flex items-center gap-1 text-[10px] text-red-500"><AlertCircle className="h-3 w-3" />{errors.to}</p>}
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">Subject</label>
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Enter subject..." className="mt-1 w-full rounded-xl border border-zinc-200/60 bg-zinc-50/50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-800/60 dark:bg-zinc-900/30 dark:text-zinc-100" />
            {errors.subject && <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{errors.subject}</p>}
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">Priority</label>
            <div className="mt-1 flex gap-2">
              {priorityOptions.map((opt) => (
                <button key={opt.value} onClick={(e) => { e.preventDefault(); setForm({ ...form, priority: opt.value }); }} className={`rounded-lg border px-4 py-1.5 text-xs font-bold transition-all ${form.priority === opt.value ? opt.activeColor : opt.inactiveColor}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">Message</label>
              <div className="flex items-center gap-1">
                <button className="rounded p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><Bold className="h-3 w-3" /></button>
                <button className="rounded p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><Italic className="h-3 w-3" /></button>
                <button className="rounded p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><Link className="h-3 w-3" /></button>
                <button className="rounded p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><AtSign className="h-3 w-3" /></button>
              </div>
            </div>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} placeholder="Write your message..." className="mt-1 w-full rounded-xl border border-zinc-200/60 bg-zinc-50/50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-blue-500 resize-none dark:border-zinc-800/60 dark:bg-zinc-900/30 dark:text-zinc-100" />
            {errors.content && <p className="mt-1 flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{errors.content}</p>}
          </div>

          {/* Attachments */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">Attachments</label>
              <button onClick={handleAddAttachment} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
                <Paperclip className="h-3 w-3" /> Add File
              </button>
            </div>
            {form.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {form.attachments.map((att) => (
                  <AttachmentPreview key={att.id} attachment={att} onRemove={() => handleRemoveAttachment(att.id)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-200/60 dark:border-zinc-800/60 px-6 py-4">
          <button onClick={handleSaveDraft} className="flex items-center gap-1.5 rounded-xl border border-zinc-200/60 px-4 py-2 text-sm font-bold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800/60 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors">
            <Save className="h-3.5 w-3.5" /> Save Draft
          </button>
          <button onClick={handleSend} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20">
            <Send className="h-3.5 w-3.5" /> {isBroadcast ? 'Send Broadcast' : 'Send Message'}
          </button>
        </div>
      </div>
    </div>
  );
};