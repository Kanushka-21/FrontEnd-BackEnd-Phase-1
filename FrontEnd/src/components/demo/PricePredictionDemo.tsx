import React, { useState } from 'react';
import { Brain, Gem, DollarSign, TrendingUp } from 'lucide-react';
import AIPricePrediction from '@/components/common/AIPricePrediction';

const PricePredictionDemo: React.FC = () => {
  const [gemData, setGemData] = useState({
    weight: '2.5',
    color: 'Blue',
    cut: 'Excellent',
    clarity: 'VS1',
    species: 'Sapphire',
    isCertified: true,
    shape: 'Round',
    treatment: 'Heat Treatment'
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setGemData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Brain className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">AI Price Prediction Demo</h1>
        </div>
        <p className="text-gray-600">
          Experience dynamic gemstone price estimation powered by machine learning
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Gem className="h-5 w-5 text-blue-600" />
            <span>Gemstone Details</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (carats)
              </label>
              <input
                type="text"
                value={gemData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 2.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <select
                value={gemData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Blue">Blue</option>
                <option value="Red">Red</option>
                <option value="Pink">Pink</option>
                <option value="Yellow">Yellow</option>
                <option value="Green">Green</option>
                <option value="White">White</option>
                <option value="Purple">Purple</option>
                <option value="Orange">Orange</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Species
              </label>
              <select
                value={gemData.species}
                onChange={(e) => handleInputChange('species', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Sapphire">Sapphire</option>
                <option value="Ruby">Ruby</option>
                <option value="Emerald">Emerald</option>
                <option value="Diamond">Diamond</option>
                <option value="Spinel">Spinel</option>
                <option value="Garnet">Garnet</option>
                <option value="Tourmaline">Tourmaline</option>
                <option value="Topaz">Topaz</option>
                <option value="Aquamarine">Aquamarine</option>
                <option value="Moonstone">Moonstone</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cut Quality
              </label>
              <select
                value={gemData.cut}
                onChange={(e) => handleInputChange('cut', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Excellent">Excellent</option>
                <option value="Very Good">Very Good</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clarity
              </label>
              <select
                value={gemData.clarity}
                onChange={(e) => handleInputChange('clarity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="FL">FL (Flawless)</option>
                <option value="IF">IF (Internally Flawless)</option>
                <option value="VVS1">VVS1 (Very Very Slightly Included 1)</option>
                <option value="VVS2">VVS2 (Very Very Slightly Included 2)</option>
                <option value="VS1">VS1 (Very Slightly Included 1)</option>
                <option value="VS2">VS2 (Very Slightly Included 2)</option>
                <option value="SI1">SI1 (Slightly Included 1)</option>
                <option value="SI2">SI2 (Slightly Included 2)</option>
                <option value="I1">I1 (Included 1)</option>
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={gemData.isCertified}
                  onChange={(e) => handleInputChange('isCertified', e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Certified Gemstone</span>
              </label>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-800">How It Works</h3>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Analyzes gemstone characteristics</li>
              <li>• Applies market-based pricing models</li>
              <li>• Considers certification premiums</li>
              <li>• Provides confidence scoring</li>
              <li>• Updates in real-time</li>
            </ul>
          </div>
        </div>

        {/* AI Prediction Display */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>AI Price Prediction</span>
          </h2>

          <AIPricePrediction 
            gemData={gemData}
            showDetails={true}
            className="shadow-lg border-2 border-indigo-300"
          />

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Real-Time Features</h3>
            <div className="text-sm text-green-700 space-y-1">
              <p>✅ Dynamic price calculation</p>
              <p>✅ Market trend analysis</p>
              <p>✅ Quality factor scoring</p>
              <p>✅ Certification impact</p>
              <p>✅ Price range estimation</p>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">Integration Benefits</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• Replaces static price estimates</p>
              <p>• Improves pricing accuracy</p>
              <p>• Builds buyer confidence</p>
              <p>• Provides market insights</p>
              <p>• Supports fair pricing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-100 rounded-full">
          <Brain className="h-4 w-4 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-800">
            Powered by Advanced Machine Learning Algorithms
          </span>
        </div>
      </div>
    </div>
  );
};

export default PricePredictionDemo;
