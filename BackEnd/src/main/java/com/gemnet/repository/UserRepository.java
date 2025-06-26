package com.gemnet.repository;

import com.gemnet.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    
    // Find user by email
    Optional<User> findByEmail(String email);
    
    // Find user by NIC number
    Optional<User> findByNicNumber(String nicNumber);
    
    // Check if email exists
    boolean existsByEmail(String email);
    
    // Check if NIC number exists
    boolean existsByNicNumber(String nicNumber);
    
    // Find verified users
    List<User> findByIsVerified(boolean isVerified);
    
    // Find users by verification status
    List<User> findByVerificationStatus(String verificationStatus);
    
    // Find active users
    List<User> findByIsActive(boolean isActive);
    
    // Find users by email and active status
    Optional<User> findByEmailAndIsActive(String email, boolean isActive);
    
    // Custom query to find pending verification users
    @Query("{'verificationStatus': 'PENDING', 'isActive': true}")
    List<User> findPendingVerificationUsers();
    
    // Custom query to find verified and active users
    @Query("{'isVerified': true, 'isActive': true}")
    List<User> findVerifiedActiveUsers();
}
