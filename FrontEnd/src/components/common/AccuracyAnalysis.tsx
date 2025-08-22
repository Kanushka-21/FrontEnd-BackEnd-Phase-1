import React, { useEffect, useState } from 'react';
import { TrendingUp, Target, CheckCircle, AlertTriangle, XCircle, BarChart3, Loader2 } from 'lucide-react';

interface AccuracyResult {
  listingId: string;
  gemName: string;
  species: string;
  weight: string;
  color: string;
  actualPrice: number;
  predictedPrice: number;
  priceRange: string;
  accuracyPercentage: number;
  modelConfidence: number;
  isCertified: boolean;
  currency: string;
  accuracyGrade: string;
}

interface OverallStatistics {
  averageAccuracy: number;
  highAccuracyCount: number;
  mediumAccuracyCount: number;
  lowAccuracyCount: number;
  highAccuracyPercentage: number;
  mediumAccuracyPercentage: number;
  lowAccuracyPercentage: number;
}

interface AccuracyAnalysisData {
  totalListings: number;
  accuracyResults: AccuracyResult[];
  overallStatistics: OverallStatistics;
  status: string;
  message: string;
}

const AccuracyAnalysis: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<AccuracyAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccuracyAnalysis();
  }, []);

  const fetchAccuracyAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:9092/api/predictions/accuracy-analysis', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (err) {
      console.error('Error fetching accuracy analysis:', err);
      setError('Failed to fetch accuracy analysis. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyIcon = (accuracy: number) => {
    if (accuracy >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (accuracy >= 60) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Very Good': return 'bg-blue-100 text-blue-800';
      case 'Good': return 'bg-yellow-100 text-yellow-800';
      case 'Fair': return 'bg-orange-100 text-orange-800';
      case 'Poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-blue-600">Analyzing prediction accuracy...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <XCircle className="h-5 w-5 text-red-600" />
          <h3 className="text-red-800 font-medium">Analysis Failed</h3>
        </div>
        <p className="text-red-700 mt-1">{error}</p>
        <button
          onClick={fetchAccuracyAnalysis}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-600">No analysis data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <Target className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-blue-800">AI Price Prediction Accuracy Analysis</h2>
        </div>
        <p className="text-blue-700">
          Real accuracy analysis comparing AI predictions with actual listed prices for {analysisData.totalListings} gemstones
        </p>
      </div>

      {/* Overall Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Overall Performance</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {analysisData.overallStatistics.averageAccuracy && !isNaN(analysisData.overallStatistics.averageAccuracy) 
                ? analysisData.overallStatistics.averageAccuracy + '%'
                : 'N/A'
              }
            </div>
            <div className="text-sm text-blue-700">Average Accuracy</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {analysisData.overallStatistics.highAccuracyPercentage && !isNaN(analysisData.overallStatistics.highAccuracyPercentage) 
                ? analysisData.overallStatistics.highAccuracyPercentage + '%'
                : 'N/A'
              }
            </div>
            <div className="text-sm text-green-700">
              High Accuracy (70%+) - {analysisData.overallStatistics.highAccuracyCount} items
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">
              {analysisData.overallStatistics.mediumAccuracyPercentage && !isNaN(analysisData.overallStatistics.mediumAccuracyPercentage) 
                ? analysisData.overallStatistics.mediumAccuracyPercentage + '%'
                : 'N/A'
              }
            </div>
            <div className="text-sm text-yellow-700">
              Medium Accuracy (40-69%) - {analysisData.overallStatistics.mediumAccuracyCount} items
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="text-2xl font-bold text-red-600">
              {analysisData.overallStatistics.lowAccuracyPercentage && !isNaN(analysisData.overallStatistics.lowAccuracyPercentage) 
                ? analysisData.overallStatistics.lowAccuracyPercentage + '%'
                : 'N/A'
              }
            </div>
            <div className="text-sm text-red-700">
              Low Accuracy (under 40%) - {analysisData.overallStatistics.lowAccuracyCount} items
            </div>
          </div>
        </div>
      </div>

      {/* Individual Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Individual Item Accuracy</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gemstone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Predicted Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accuracy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analysisData.accuracyResults.map((result) => (
                <tr key={result.listingId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{result.gemName}</div>
                      <div className="text-sm text-gray-500">
                        {result.species} • {result.weight} • {result.color}
                        {result.isCertified && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Certified
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(result.actualPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{formatPrice(result.predictedPrice)}</div>
                      <div className="text-xs text-gray-500">{result.priceRange}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getAccuracyIcon(result.accuracyPercentage)}
                      <span className={`font-medium ${getAccuracyColor(result.accuracyPercentage)}`}>
                        {result.accuracyPercentage && !isNaN(result.accuracyPercentage) 
                          ? result.accuracyPercentage + '%'
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(result.accuracyGrade)}`}>
                      {result.accuracyGrade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.modelConfidence}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchAccuracyAnalysis}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <TrendingUp className="h-4 w-4" />
          <span>Refresh Analysis</span>
        </button>
      </div>
    </div>
  );
};

export default AccuracyAnalysis;
