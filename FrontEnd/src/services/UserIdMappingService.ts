// User ID mapping service for resolving authentication user IDs to marketplace user IDs
export class UserIdMappingService {
  private static marketplaceUserCache: Map<string, string> = new Map();

  /**
   * Resolve the correct marketplace user ID for notifications
   * @param authUser - The authenticated user object
   * @returns Promise<string> - The correct marketplace user ID
   */
  static async resolveMarketplaceUserId(authUser: any): Promise<string> {
    if (!authUser) {
      throw new Error('No authenticated user provided');
    }

    // Create a cache key based on user information
    const cacheKey = `${authUser.userId || authUser.id}_${authUser.email || authUser.firstName}`;
    
    // Check cache first
    if (this.marketplaceUserCache.has(cacheKey)) {
      console.log('🎯 UserIdMapping: Using cached marketplace user ID');
      return this.marketplaceUserCache.get(cacheKey)!;
    }

    try {
      console.log('🔍 UserIdMapping: Resolving marketplace user ID for:', {
        authUserId: authUser.userId || authUser.id,
        userName: `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim(),
        email: authUser.email
      });

      // Method 1: Try to find user by name in marketplace listings
      const marketplaceUserId = await this.findUserInMarketplace(authUser);
      
      if (marketplaceUserId) {
        // Cache the result
        this.marketplaceUserCache.set(cacheKey, marketplaceUserId);
        console.log('✅ UserIdMapping: Found marketplace user ID:', marketplaceUserId);
        return marketplaceUserId;
      }

      // Method 2: Fallback to original user ID if no mapping found
      console.log('⚠️ UserIdMapping: No marketplace mapping found, using auth user ID');
      const fallbackId = authUser.userId || authUser.id;
      this.marketplaceUserCache.set(cacheKey, fallbackId);
      return fallbackId;

    } catch (error) {
      console.error('❌ UserIdMapping: Error resolving user ID:', error);
      // Return the original user ID as fallback
      return authUser.userId || authUser.id;
    }
  }

  /**
   * Find user in marketplace listings by name matching
   */
  private static async findUserInMarketplace(authUser: any): Promise<string | null> {
    try {
      const response = await fetch('http://localhost:9092/api/marketplace/listings');
      
      if (!response.ok) {
        console.warn('⚠️ UserIdMapping: Could not fetch marketplace listings');
        return null;
      }

      const result = await response.json();
      
      if (!result.success || !result.data?.listings) {
        console.warn('⚠️ UserIdMapping: Invalid marketplace response');
        return null;
      }

      const listings = result.data.listings;
      const userFullName = `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim().toLowerCase();
      const userEmail = (authUser.email || '').toLowerCase();

      console.log('🔍 UserIdMapping: Searching for user:', userFullName, 'Email:', userEmail);

      // Find matching listings by name or email
      const matchingListings = listings.filter((listing: any) => {
        const listingUserName = (listing.userName || '').toLowerCase();
        const listingEmail = (listing.userEmail || '').toLowerCase();

        // Match by name (flexible matching)
        const nameMatch = userFullName && listingUserName.includes(userFullName.replace(/\s+/g, ''));
        const reverseNameMatch = userFullName && userFullName.replace(/\s+/g, '').includes(listingUserName.replace(/\s+/g, ''));
        
        // Match by email
        const emailMatch = userEmail && listingEmail === userEmail;

        return nameMatch || reverseNameMatch || emailMatch;
      });

      if (matchingListings.length > 0) {
        const marketplaceUserId = matchingListings[0].userId;
        console.log('✅ UserIdMapping: Found marketplace user:', {
          marketplaceUserId,
          userName: matchingListings[0].userName,
          matchedBy: 'name/email'
        });
        return marketplaceUserId;
      }

      console.log('⚠️ UserIdMapping: No matching user found in marketplace');
      return null;

    } catch (error) {
      console.error('❌ UserIdMapping: Error searching marketplace:', error);
      return null;
    }
  }

  /**
   * Clear the cache (useful for testing or user logout)
   */
  static clearCache(): void {
    this.marketplaceUserCache.clear();
    console.log('🧹 UserIdMapping: Cache cleared');
  }

  /**
   * Get cache status for debugging
   */
  static getCacheStatus(): { size: number; entries: string[] } {
    return {
      size: this.marketplaceUserCache.size,
      entries: Array.from(this.marketplaceUserCache.keys())
    };
  }
}
