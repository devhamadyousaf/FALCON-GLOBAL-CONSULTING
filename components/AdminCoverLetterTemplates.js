import { useState, useEffect } from 'react';
import Modal from './Modal';
import LoadingButton from './LoadingButton';

export default function AdminCoverLetterTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, text, pdf

  // Form states
  const [templateName, setTemplateName] = useState('');
  const [templateContent, setTemplateContent] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cover-letter-templates?userId=admin&isAdmin=true');
      const data = await response.json();
      
      if (response.ok) {
        setTemplates(data.templates || []);
      } else {
        console.error('Error fetching templates:', data.error);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateContent(template.content || '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateContent('');
  };

  const updateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/cover-letter-templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: templateName, 
          content: templateContent 
        })
      });

      const data = await response.json();
      if (response.ok) {
        await fetchTemplates();
        closeModal();
      } else {
        alert('Error updating template: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Error updating template');
    } finally {
      setLoading(false);
    }
  };

  const toggleTemplateStatus = async (template) => {
    try {
      const response = await fetch(`/api/cover-letter-templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !template.is_active })
      });

      if (response.ok) {
        await fetchTemplates();
      } else {
        const data = await response.json();
        alert('Error updating status: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || template.type === filterType;
    return matchesSearch && matchesType;
  });

  const getUserEmail = (userId) => {
    // You might want to fetch user details, for now just show userId
    return userId;
  };

  return (
    <div className="admin-cover-letter-templates">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Manage Cover Letter Templates</h2>
        
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Templates</option>
            <option value="text">Text Templates</option>
          </select>
        </div>

        <div className="flex gap-4 text-sm text-gray-600">
          <span>Total: {templates.length}</span>
          <span>Text: {templates.filter(t => t.type === 'text').length}</span>
          <span>Active: {templates.filter(t => t.is_active).length}</span>
        </div>
      </div>

      {loading && templates.length === 0 ? (
        <div className="text-center py-8">Loading templates...</div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No templates found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`border rounded-lg p-4 ${
                template.is_active ? 'bg-white' : 'bg-gray-50 opacity-75'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      template.type === 'pdf' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {template.type.toUpperCase()}
                    </span>
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Created: {new Date(template.created_at).toLocaleDateString()} • 
                    Updated: {new Date(template.updated_at).toLocaleDateString()}
                    {template.user_email && (
                      <>
                        {' • '}
                        <span className="text-blue-600 font-medium">
                          User: {template.user_email.full_name || template.user_email.email}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleTemplateStatus(template)}
                    className={`px-3 py-1.5 rounded text-sm ${
                      template.is_active 
                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {template.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  {template.type === 'text' && (
                    <button
                      onClick={() => openEditModal(template)}
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                    >
                      Edit Content
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Template Details</p>
                  {template.type === 'text' ? (
                    <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                        {template.content}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-700">📄 {template.file_name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Size: {(template.file_size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  )}
                </div>

                {template.type === 'text' && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Variables Used</p>
                    <div className="bg-blue-50 p-3 rounded">
                      {(() => {
                        const variables = template.content?.match(/\{\{([^}]+)\}\}/g) || [];
                        const uniqueVars = [...new Set(variables)];
                        return uniqueVars.length > 0 ? (
                          <ul className="text-sm space-y-1">
                            {uniqueVars.map((v, i) => (
                              <li key={i} className="text-blue-800 font-mono">{v}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No variables found</p>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && editingTemplate && (
        <Modal onClose={closeModal}>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Edit Template: {editingTemplate.name}</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Template Name</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {editingTemplate.type === 'text' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Template Content
                  <span className="text-xs text-gray-500 ml-2">
                    (Use {'{'}{'{'} company_name {'}'}{'}'},  {'{'}{'{'} job_title {'}'}{'}'}, etc.)
                  </span>
                </label>
                <textarea
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                />
                <div className="mt-2 text-xs text-gray-600">
                  <p className="font-medium mb-1">Available variables:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p>{'{'}{'{'} company_name {'}'}{'}'}</p>
                      <p>{'{'}{'{'} job_title {'}'}{'}'}</p>
                    </div>
                    <div>
                      <p>{'{'}{'{'} location {'}'}{'}'}</p>
                      <p>{'{'}{'{'} user_name {'}'}{'}'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <LoadingButton
                onClick={updateTemplate}
                loading={loading}
                disabled={!templateName || (editingTemplate.type === 'text' && !templateContent)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Update Template
              </LoadingButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
