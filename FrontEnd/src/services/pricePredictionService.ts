import { api } from './api';

export interface PricePredictionRequest {
  carat: number;
  color: string;
  cut: string;
  clarity: string;
  species: string;
  length?: number;
  width?: number;
  depth?: number;
  isCertified?: boolean;
  treatment?: string;
  origin?: string;
  shape?: string;
}

export interface PricePredictionResponse {
  predictedPrice: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
  confidenceScore: number;
  status: string;
  message?: string;
}

export class PricePredictionService {
  /**
   * Predict price based on gemstone attributes
   */
  static async predictPrice(request: PricePredictionRequest): Promise<PricePredictionResponse> {
    try {
      const response = await api.post('/predictions/predict', request);
      return response.data;
    } catch (error: any) {
      console.error('Price prediction failed:', error);
      
      // Return error response in the expected format
      return {
        predictedPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        currency: 'LKR',
        confidenceScore: 0,
        status: 'ERROR',
        message: error.response?.data?.message || 'Price prediction failed'
      };
    }
  }

  /**
   * Predict price for an existing gem listing
   */
  static async predictPriceForListing(listingId: string): Promise<PricePredictionResponse> {
    try {
      const response = await api.get(`/predictions/predict/${listingId}`);
      return response.data;
    } catch (error: any) {
      console.error('Price prediction for listing failed:', error);
      
      return {
        predictedPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        currency: 'LKR',
        confidenceScore: 0,
        status: 'ERROR',
        message: error.response?.data?.message || 'Price prediction failed'
      };
    }
  }

  /**
   * Get price predictions for multiple listings
   */
  static async predictPricesForListings(listingIds: string[]): Promise<{ [key: string]: PricePredictionResponse }> {
    try {
      const response = await api.post('/predictions/predict/bulk', listingIds);
      return response.data;
    } catch (error: any) {
      console.error('Bulk price prediction failed:', error);
      return {};
    }
  }

  /**
   * Format price for display
   */
  static formatPrice(price: number, currency: string = 'LKR'): string {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  /**
   * Format price range for display
   */
  static formatPriceRange(minPrice: number, maxPrice: number, currency: string = 'LKR'): string {
    const min = this.formatPrice(minPrice, currency);
    const max = this.formatPrice(maxPrice, currency);
    return `${min} - ${max}`;
  }

  /**
   * Extract carat weight from weight string
   */
  static extractCarat(weight: string): number {
    if (!weight) return 1.0;
    
    const caratMatch = weight.match(/([0-9.]+)/);
    if (caratMatch) {
      return parseFloat(caratMatch[1]);
    }
    
    return 1.0; // Default to 1 carat
  }

  /**
   * Convert gem listing to prediction request
   */
  static gemListingToPredictionRequest(listing: any): PricePredictionRequest {
    return {
      carat: this.extractCarat(listing.weight || '1.0'),
      color: listing.color || '',
      cut: listing.cut || '',
      clarity: listing.clarity || '',
      species: listing.species || '',
      isCertified: listing.isCertified || false,
      treatment: listing.treatment || '',
      origin: listing.origin || '',
      shape: listing.shape || ''
    };
  }

  /**
   * Health check for prediction service
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await api.get('/predictions/health');
      return response.status === 200;
    } catch (error) {
      console.error('Price prediction service health check failed:', error);
      return false;
    }
  }
}
