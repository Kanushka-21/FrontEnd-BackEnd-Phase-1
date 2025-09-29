import axios from 'axios';

const API_BASE_URL = 'http://localhost:9092/api/advertisements';

export interface Advertisement {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  mobileNo: string;
  email: string;
  images: string[];
  approved: boolean;
  createdOn: string;
  userId: string;
}

export const advertisementService = {
  // Get all approved advertisements
  getApprovedAdvertisements: async (): Promise<Advertisement[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}?approved=approved`);
      
      // Check if response.data is an array (direct array response) or has a success field
      let advertisements: any[] = [];
      
      if (Array.isArray(response.data)) {
        advertisements = response.data;
      } else if (response.data.success && response.data.data) {
        advertisements = response.data.data;
      } else if (response.data.data) {
        advertisements = response.data.data;
      }
      
      return advertisements.map((ad: any) => ({
        ...ad,
        _id: ad.id || ad._id, // Handle both id and _id
        // Transform image paths to proper URLs
        images: ad.images ? ad.images.map((imagePath: string) => {
          if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
          }
          const fileName = imagePath.split('/').pop() || imagePath.split('\\').pop();
          return `http://localhost:9092/uploads/advertisement-images/${fileName}`;
        }) : []
      }));
    } catch (error) {
      console.error('Error fetching approved advertisements:', error);
      return [];
    }
  },

  // Get random approved advertisement for popup
  getRandomApprovedAdvertisement: async (): Promise<Advertisement | null> => {
    try {
      const approvedAds = await advertisementService.getApprovedAdvertisements();
      if (approvedAds.length === 0) return null;
      
      // Get random advertisement
      const randomIndex = Math.floor(Math.random() * approvedAds.length);
      return approvedAds[randomIndex];
    } catch (error) {
      console.error('Error fetching random advertisement:', error);
      return null;
    }
  }
};
