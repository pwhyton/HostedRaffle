import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/endpoints.js';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: adminApi.getSettings,
  });

  const updateMutation = useMutation({
    mutationFn: adminApi.updateSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      setEditingKey(null);
      setNewKey('');
      setNewValue('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteSetting,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-settings'] }),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Global Settings</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Key</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Value</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {settings?.map((setting) => (
              <tr key={setting.key}>
                <td className="px-4 py-3 font-mono text-sm">{setting.key}</td>
                <td className="px-4 py-3">
                  {editingKey === setting.key ? (
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="border rounded px-2 py-1 w-full text-sm"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm">{setting.value}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  {editingKey === setting.key ? (
                    <>
                      <button
                        onClick={() => updateMutation.mutate({ key: setting.key, value: editValue })}
                        className="text-sm text-green-600 hover:underline"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingKey(null)}
                        className="text-sm text-gray-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setEditingKey(setting.key); setEditValue(setting.value); }}
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete setting "${setting.key}"?`)) deleteMutation.mutate(setting.key); }}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium mb-4">Add Setting</h3>
        <div className="flex gap-3">
          <input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Key"
            className="flex-1 border rounded-md px-3 py-2 text-sm font-mono"
          />
          <input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Value"
            className="flex-1 border rounded-md px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              if (newKey && newValue) updateMutation.mutate({ key: newKey, value: newValue });
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
