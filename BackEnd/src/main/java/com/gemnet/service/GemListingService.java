package com.gemnet.service;

import com.gemnet.model.GemListing;
import com.gemnet.repository.GemListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for GemListing operations
 */
@Service
public class GemListingService {

    @Autowired
    private GemListingRepository gemListingRepository;

    /**
     * Get gem listing by ID
     */
    public GemListing getById(String id) {
        Optional<GemListing> listing = gemListingRepository.findById(id);
        return listing.orElse(null);
    }

    /**
     * Save gem listing
     */
    public GemListing save(GemListing gemListing) {
        return gemListingRepository.save(gemListing);
    }

    /**
     * Update gem listing
     */
    public GemListing update(GemListing gemListing) {
        gemListing.updateTimestamp();
        return gemListingRepository.save(gemListing);
    }

    /**
     * Delete gem listing
     */
    public void deleteById(String id) {
        gemListingRepository.deleteById(id);
    }

    /**
     * Check if gem listing exists
     */
    public boolean existsById(String id) {
        return gemListingRepository.existsById(id);
    }

    /**
     * Get all active gem listings for accuracy analysis
     */
    public List<GemListing> getAllActiveListings() {
        return gemListingRepository.findByIsActiveTrueAndListingStatusIn(
            List.of("ACTIVE", "APPROVED")
        );
    }

    /**
     * Get all gem listings (for admin purposes)
     */
    public List<GemListing> getAllListings() {
        return gemListingRepository.findAll();
    }
}
