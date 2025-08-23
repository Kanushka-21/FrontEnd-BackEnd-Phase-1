const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9092';

export interface Meeting {
  id?: string;
  buyerId: string;
  sellerId: string;
  purchaseId: string;
  gemId: string;
  
  // Meeting details
  proposedDateTime: string;
  location: string;
  meetingType: 'IN_PERSON' | 'VIDEO_CALL';
  status: 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';
  
  // Additional details
  notes?: string;
  
  // Contact information (populated after confirmation)
  buyerContact?: string;
  sellerContact?: string;
  
  // Financial information
  gemPrice: number;
  commissionAmount: number;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMeetingRequest {
  purchaseId: string;
  buyerId: string;
  proposedDateTime: string;
  location: string;
  meetingType: 'IN_PERSON' | 'VIDEO_CALL';
  buyerNotes?: string;
}

export interface RescheduleMeetingRequest {
  newDateTime: string;
  newLocation?: string;
  reason?: string;
}

class MeetingService {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Create a new meeting request
  async createMeeting(meetingData: CreateMeetingRequest): Promise<Meeting> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/meetings/create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(meetingData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to create meeting: ${errorData}`);
      }

      const result = await response.json();
      return result.meeting || result;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  }

  // Get meetings for a specific user
  async getUserMeetings(userId: string): Promise<Meeting[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/meetings/user/${userId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user meetings');
      }

      const result = await response.json();
      return result.meetings || result;
    } catch (error) {
      console.error('Error fetching user meetings:', error);
      throw error;
    }
  }

  // Get meetings for a buyer
  async getBuyerMeetings(buyerId: string): Promise<Meeting[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/meetings/buyer/${buyerId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch buyer meetings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching buyer meetings:', error);
      throw error;
    }
  }

  // Get meetings for a seller
  async getSellerMeetings(sellerId: string): Promise<Meeting[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/meetings/seller/${sellerId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch seller meetings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching seller meetings:', error);
      throw error;
    }
  }

  // Confirm a meeting
  async confirmMeeting(meetingId: string): Promise<Meeting> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}/confirm`, {
        method: 'PUT',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to confirm meeting');
      }

      const result = await response.json();
      return result.meeting || result;
    } catch (error) {
      console.error('Error confirming meeting:', error);
      throw error;
    }
  }

  // Reschedule a meeting
  async rescheduleMeeting(meetingId: string, rescheduleData: RescheduleMeetingRequest): Promise<Meeting> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}/reschedule`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(rescheduleData)
      });

      if (!response.ok) {
        throw new Error('Failed to reschedule meeting');
      }

      return await response.json();
    } catch (error) {
      console.error('Error rescheduling meeting:', error);
      throw error;
    }
  }

  // Cancel a meeting
  async cancelMeeting(meetingId: string, reason?: string): Promise<Meeting> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}/cancel`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel meeting');
      }

      return await response.json();
    } catch (error) {
      console.error('Error canceling meeting:', error);
      throw error;
    }
  }

  // Complete a meeting
  async completeMeeting(meetingId: string): Promise<Meeting> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}/complete`, {
        method: 'PUT',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to complete meeting');
      }

      return await response.json();
    } catch (error) {
      console.error('Error completing meeting:', error);
      throw error;
    }
  }

  // Get meeting by ID
  async getMeetingById(meetingId: string): Promise<Meeting> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch meeting');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching meeting:', error);
      throw error;
    }
  }

  // Get meetings by date range
  async getMeetingsInDateRange(startDate: string, endDate: string): Promise<Meeting[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/meetings/date-range?start=${startDate}&end=${endDate}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch meetings in date range');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching meetings in date range:', error);
      throw error;
    }
  }

  // Admin: Get all meetings
  async getAllMeetings(): Promise<Meeting[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/meetings/admin/all`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch all meetings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching all meetings:', error);
      throw error;
    }
  }

  // Get seller information for a purchase (to show seller details when scheduling)
  async getSellerForPurchase(purchaseId: string): Promise<any> {
    try {
      // This would typically get the seller info from the purchase record
      const response = await fetch(`${API_BASE_URL}/api/gemlistings/purchase/${purchaseId}/seller`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch seller information');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching seller information:', error);
      throw error;
    }
  }
}

export default new MeetingService();
