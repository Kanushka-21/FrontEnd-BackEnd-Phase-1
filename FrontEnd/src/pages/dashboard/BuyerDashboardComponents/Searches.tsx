import React, { useState } from 'react';
import { Search, Bookmark, Trash2, Plus, X } from 'lucide-react';

interface SearchesProps {
  user: any;
}

const Searches: React.FC<SearchesProps> = ({ user }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSearch, setNewSearch] = useState({ query: '', category: '', priceRange: '' });

  // Mock saved searches data
  const [savedSearches, setSavedSearches] = useState([
    
    {
      id: 2,
      query: 'Ruby Ring',
      category: 'Jewelry',
      priceRange: 'LKR 200,000 - 400,000',
      results: 18,
      lastUpdated: '2024-01-14',
      notifications: false
    },
    {
      id: 3,
      query: 'Emerald Necklace',
      category: 'Jewelry',
      priceRange: 'Any',
      results: 12,
      lastUpdated: '2024-01-13',
      notifications: true
    }
  ]);

  const handleAddSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = Math.max(...savedSearches.map(s => s.id)) + 1;
    setSavedSearches([
      ...savedSearches,
      {
        id: newId,
        query: newSearch.query,
        category: newSearch.category || 'All Categories',
        priceRange: newSearch.priceRange || 'Any',
        results: Math.floor(Math.random() * 50) + 1,
        lastUpdated: new Date().toISOString().split('T')[0],
        notifications: true
      }
    ]);
    setNewSearch({ query: '', category: '', priceRange: '' });
    setShowAddForm(false);
  };

  const handleDeleteSearch = (id: number) => {
    setSavedSearches(savedSearches.filter(search => search.id !== id));
  };

  const toggleNotifications = (id: number) => {
    setSavedSearches(savedSearches.map(search => 
      search.id === id ? { ...search, notifications: !search.notifications } : search
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Saved Searches</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Save New Search</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Save New Search</h3>
            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleAddSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Query *</label>
              <input
                type="text"
                value={newSearch.query}
                onChange={(e) => setNewSearch({...newSearch, query: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Blue Sapphire, Diamond Ring"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newSearch.category}
                  onChange={(e) => setNewSearch({...newSearch, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="Gemstones">Gemstones</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Rings">Rings</option>
                  <option value="Necklaces">Necklaces</option>
                  <option value="Earrings">Earrings</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <input
                  type="text"
                  value={newSearch.priceRange}
                  onChange={(e) => setNewSearch({...newSearch, priceRange: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., LKR 100,000 - 500,000"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Search
              </button>
            </div>
          </form>
        </div>
      )}

      {savedSearches.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Search Query
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Results
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notifications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {savedSearches.map((search) => (
                  <tr key={search.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Search className="w-4 h-4 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">{search.query}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {search.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {search.priceRange}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {search.results} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {search.lastUpdated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleNotifications(search.id)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          search.notifications ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            search.notifications ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900" title="Run Search">
                          <Search size={16} />
                        </button>
                        <button className="text-green-600 hover:text-green-900" title="Bookmark">
                          <Bookmark size={16} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900" 
                          title="Delete"
                          onClick={() => handleDeleteSearch(search.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No saved searches</h3>
          <p className="text-gray-500 mb-4">Save your favorite searches to get notified when new items match.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 mx-auto"
          >
            <Plus size={16} />
            <span>Save Your First Search</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Searches;
