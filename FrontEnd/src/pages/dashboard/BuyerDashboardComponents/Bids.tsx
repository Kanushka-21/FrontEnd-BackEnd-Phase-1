import React from 'react';
import { TrendingUp, Eye, X } from 'lucide-react';

interface BidsProps {
  user: any;
}

const Bids: React.FC<BidsProps> = ({ user }) => {
  // Mock bids data
  const bids = [
    {
      id: 1,
      item: 'Emerald Pendant',
      seller: 'Luxury Gems Inc',
      bidAmount: 'LKR 320,000',
      currentHighest: 'LKR 350,000',
      status: 'Active',
      endDate: '2024-02-15',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=60&h=60&fit=crop'
    },
    {
      id: 2,
      item: 'Diamond Earrings',
      seller: 'Premium Stones Ltd',
      bidAmount: 'LKR 580,000',
      currentHighest: 'LKR 580,000',
      status: 'Winning',
      endDate: '2024-02-20',
      image: 'https://images.unsplash.com/photo-1506792006437-256b665541e2?w=60&h=60&fit=crop'
    },
    {
      id: 3,
      item: 'Ruby Ring',
      seller: 'GemMaster Co',
      bidAmount: 'LKR 420,000',
      currentHighest: 'LKR 450,000',
      status: 'Outbid',
      endDate: '2024-01-30',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=60&h=60&fit=crop'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">My Bids</h2>
        <div className="text-sm text-gray-500">
          Active bids: {bids.filter(bid => bid.status === 'Active' || bid.status === 'Winning').length}
        </div>
      </div>

      {bids.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    My Bid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Highest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bids.map((bid) => (
                  <tr key={bid.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img className="h-10 w-10 rounded-lg object-cover" src={bid.image} alt={bid.item} />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{bid.item}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bid.seller}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bid.bidAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bid.currentHighest}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        bid.status === 'Winning' 
                          ? 'bg-green-100 text-green-800'
                          : bid.status === 'Active'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {bid.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bid.endDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900" title="View Details">
                          <Eye size={16} />
                        </button>
                        {(bid.status === 'Active' || bid.status === 'Outbid') && (
                          <button className="text-red-600 hover:text-red-900" title="Withdraw Bid">
                            <X size={16} />
                          </button>
                        )}
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
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bids yet</h3>
          <p className="text-gray-500 mb-4">Your bids on items will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default Bids;
