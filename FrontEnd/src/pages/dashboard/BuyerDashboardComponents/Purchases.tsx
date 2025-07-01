import React from 'react';
import { ShoppingBag, Package, Calendar, Star } from 'lucide-react';

interface PurchasesProps {
  user: any;
}

const Purchases: React.FC<PurchasesProps> = ({ user }) => {
  // Mock purchase data
  const purchases = [
    {
      id: 1,
      item: 'Blue Sapphire Ring',
      seller: 'Premium Gems Ltd',
      amount: 'LKR 450,000',
      date: '2024-01-15',
      status: 'Delivered',
      image: 'https://images.unsplash.com/photo-1506792006437-256b665541e2?w=60&h=60&fit=crop'
    },
    {
      id: 2,
      item: 'Ruby Necklace',
      seller: 'GemMaster Co',
      amount: 'LKR 750,000',
      date: '2024-01-10',
      status: 'In Transit',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=60&h=60&fit=crop'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Purchase History</h2>
        <div className="text-sm text-gray-500">
          Total purchases: {purchases.length}
        </div>
      </div>

      {purchases.length > 0 ? (
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
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img className="h-10 w-10 rounded-lg object-cover" src={purchase.image} alt={purchase.item} />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{purchase.item}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.seller}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {purchase.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        purchase.status === 'Delivered' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900" title="View Details">
                          <Package size={16} />
                        </button>
                        {purchase.status === 'Delivered' && (
                          <button className="text-green-600 hover:text-green-900" title="Rate Seller">
                            <Star size={16} />
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
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases yet</h3>
          <p className="text-gray-500 mb-4">Your completed purchases will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default Purchases;
