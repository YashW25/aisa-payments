'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ClientEditForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: initialData.title,
    slug: initialData.slug,
    description: initialData.description || '',
    amount: initialData.amount.toString(),
    upiId: initialData.upiId,
    enablePlatformFee: initialData.enablePlatformFee,
    isActive: initialData.isActive,
  });

  // Reconstruct standard fields
  const standardFieldNames = ['name', 'email', 'phone', 'prn', 'department', 'year', 'division'];
  
  const [fields, setFields] = useState([
    { type: 'standard', name: 'name', label: 'Full Name', required: true, enabled: true },
    { type: 'standard', name: 'email', label: 'Email', required: true, enabled: true },
    { type: 'standard', name: 'phone', label: 'Phone Number', required: false, enabled: false },
    { type: 'standard', name: 'prn', label: 'PRN / Student ID', required: false, enabled: false },
    { type: 'standard', name: 'department', label: 'Department', required: false, enabled: false },
    { type: 'standard', name: 'year', label: 'Year', required: false, enabled: false },
    { type: 'standard', name: 'division', label: 'Division', required: false, enabled: false },
  ].map(f => {
    const existing = initialData.formFields.find((ef: any) => ef.name === f.name);
    if (existing) {
      return { ...f, enabled: true, required: existing.required };
    }
    return f;
  }));

  // Reconstruct custom fields
  const [customFields, setCustomFields] = useState<Array<{name: string, type: string, options: string}>>(
    initialData.formFields
      .filter((ef: any) => !standardFieldNames.includes(ef.name))
      .map((ef: any) => ({
        name: ef.name,
        type: ef.type,
        options: ef.options ? ef.options.join(', ') : '',
      }))
  );

  const handleFieldToggle = (index: number) => {
    const newFields = [...fields];
    newFields[index].enabled = !newFields[index].enabled;
    setFields(newFields);
  };

  const handleAddCustomField = () => {
    setCustomFields([...customFields, { name: '', type: 'text', options: '' }]);
  };

  const handleCustomFieldChange = (index: number, key: string, value: string) => {
    const newFields = [...customFields];
    newFields[index] = { ...newFields[index], [key]: value };
    setCustomFields(newFields);
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const finalFields = fields.filter(f => f.enabled).map(f => ({
      name: f.name,
      label: f.label,
      type: f.type,
      required: f.required
    }));

    const finalCustomFields = customFields.filter(f => f.name.trim() !== '').map(f => ({
      name: f.name,
      label: f.name,
      type: f.type,
      options: f.type === 'select' ? f.options.split(',').map(o => o.trim()) : undefined,
      required: true
    }));

    try {
      const res = await fetch(`/api/admin/links/${initialData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          formFields: [...finalFields, ...finalCustomFields],
        }),
      });

      if (res.ok) {
        router.push('/admin/links');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update payment link');
      }
    } catch (err) {
      setError('An error occurred while updating the link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-[var(--color-aisa-text)]">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/admin/links" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Edit Payment Link</h1>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/20 text-red-200 border border-red-500/50">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="p-6 rounded-xl bg-black/20 border border-white/10 space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-4">
            <h2 className="text-xl font-semibold text-[var(--color-aisa-gold)]">Payment Details</h2>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-300">Status:</label>
              <select 
                value={formData.isActive ? 'true' : 'false'} 
                onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                className={`px-3 py-1 rounded-lg text-sm font-medium outline-none ${formData.isActive ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}
              >
                <option value="true">ACTIVE</option>
                <option value="false">DISABLED</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Payment Title</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-aisa-blue)] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL Slug</label>
              <div className="flex">
                <span className="px-3 py-2 bg-black/40 border border-r-0 border-white/10 rounded-l-lg text-gray-400 text-sm flex items-center">/pay/</span>
                <input type="text" required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                  className="w-full px-4 py-2 rounded-r-lg bg-black/30 border border-white/10 focus:border-[var(--color-aisa-blue)] outline-none" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-white/10 focus:border-[var(--color-aisa-blue)] outline-none"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-3 p-4 bg-black/30 border border-white/10 rounded-lg md:col-span-2">
              <input
                type="checkbox"
                id="enablePlatformFee"
                checked={formData.enablePlatformFee}
                onChange={e => setFormData({ ...formData, enablePlatformFee: e.target.checked })}
                className="w-5 h-5 rounded border-white/20 bg-black/50 text-[var(--color-aisa-blue)] focus:ring-0 focus:ring-offset-0"
              />
              <label htmlFor="enablePlatformFee" className="text-sm font-medium text-white cursor-pointer select-none">
                Enable 2% Platform Fee
                <p className="text-xs text-gray-400 mt-1">If enabled, a 2% extra fee will be calculated and added to the user's total payment.</p>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fixed Amount (₹)</label>
              <input type="number" required min="1" step="1" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-aisa-blue)] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Receiving UPI ID</label>
              <input type="text" required value={formData.upiId} onChange={e => setFormData({...formData, upiId: e.target.value})}
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-[var(--color-aisa-blue)] outline-none" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-black/20 border border-white/10 space-y-4">
          <h2 className="text-xl font-semibold text-[var(--color-aisa-blue)] border-b border-white/10 pb-2">Information to Collect</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {fields.map((field, idx) => (
              <label key={field.name} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${field.enabled ? 'border-[var(--color-aisa-blue)] bg-[var(--color-aisa-blue)]/10' : 'border-white/10 bg-black/30 hover:bg-white/5'}`}>
                <input type="checkbox" checked={field.enabled} onChange={() => handleFieldToggle(idx)} className="hidden" disabled={field.name === 'name' || field.name === 'email'} />
                <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${field.enabled ? 'bg-[var(--color-aisa-blue)] border-[var(--color-aisa-blue)]' : 'border-gray-500'}`}>
                  {field.enabled && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                </div>
                <span className={field.enabled ? 'text-white' : 'text-gray-400'}>{field.label} {field.required && '*'}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-xl bg-black/20 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h2 className="text-xl font-semibold text-[var(--color-aisa-accent)]">Custom Fields</h2>
            <button type="button" onClick={handleAddCustomField} className="flex items-center text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-4 h-4 mr-1" /> Add Field
            </button>
          </div>
          
          <div className="space-y-4">
            {customFields.map((cf, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-4 items-start md:items-center p-4 bg-black/30 rounded-lg border border-white/5">
                <div className="flex-1 w-full">
                  <input type="text" placeholder="Field Name" required value={cf.name} onChange={e => handleCustomFieldChange(idx, 'name', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 focus:border-[var(--color-aisa-blue)] outline-none" />
                </div>
                <div className="w-full md:w-48">
                  <select value={cf.type} onChange={e => handleCustomFieldChange(idx, 'type', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 focus:border-[var(--color-aisa-blue)] outline-none appearance-none">
                    <option value="text">Short Text</option>
                    <option value="select">Dropdown Options</option>
                  </select>
                </div>
                {cf.type === 'select' && (
                  <div className="flex-1 w-full">
                    <input type="text" placeholder="Options (comma separated)" required value={cf.options} onChange={e => handleCustomFieldChange(idx, 'options', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 focus:border-[var(--color-aisa-blue)] outline-none" />
                  </div>
                )}
                <button type="button" onClick={() => handleRemoveCustomField(idx)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            {customFields.length === 0 && (
              <p className="text-gray-400 text-sm italic">No custom fields added.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading}
            className="px-8 py-3 bg-[var(--color-aisa-blue)] hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg hover:shadow-[var(--color-aisa-blue)]/20 transition-all disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
