package com.gemnet.repository;

import com.gemnet.model.Advertisement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdvertisementRepository extends MongoRepository<Advertisement, String> {
    
    List<Advertisement> findByApproved(String approved);
    
    List<Advertisement> findByUserId(String userId);
    
    List<Advertisement> findByApprovedAndUserId(Boolean approved, String userId);
    
    List<Advertisement> findByCategory(String category);
    
    List<Advertisement> findByApprovedAndCategory(Boolean approved, String category);
    
    @Query("{'title': {$regex: ?0, $options: 'i'}}")
    List<Advertisement> findByTitleContainingIgnoreCase(String title);
    
    @Query("{'approved': ?0, 'title': {$regex: ?1, $options: 'i'}}")
    List<Advertisement> findByApprovedAndTitleContainingIgnoreCase(Boolean approved, String title);
}
