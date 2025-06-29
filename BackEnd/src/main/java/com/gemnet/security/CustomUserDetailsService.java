package com.gemnet.security;

import com.gemnet.model.User;
import com.gemnet.service.UserService;
import com.gemnet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = findUserByIdentifier(identifier);
        return UserPrincipal.create(user);
    }
    
    /**
     * Find user by either email or username
     * This method handles both regular users (email) and admin users (username)
     */
    private User findUserByIdentifier(String identifier) throws UsernameNotFoundException {
        System.out.println("🔍 Looking for user with identifier: " + identifier);
        
        // Try to find by email first (for regular users)
        Optional<User> userByEmail = userService.findByEmail(identifier);
        if (userByEmail.isPresent()) {
            System.out.println("✅ Found user by email: " + identifier);
            return userByEmail.get();
        }
        
        // If not found by email, try by username (for admin users)
        Optional<User> userByUsername = userRepository.findByUsername(identifier);
        if (userByUsername.isPresent()) {
            System.out.println("✅ Found user by username: " + identifier);
            return userByUsername.get();
        }
        
        // If not found by either email or username, throw exception
        System.err.println("❌ User not found with identifier: " + identifier);
        throw new UsernameNotFoundException("User not found with identifier: " + identifier);
    }
    
    public UserDetails loadUserById(String id) {
        User user = userService.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
        
        return UserPrincipal.create(user);
    }
}

class UserPrincipal implements UserDetails {
    private String id;
    private String email;
    private String username;
    private String password;
    private Collection<? extends GrantedAuthority> authorities;
    private boolean isActive;
    private boolean isLocked;
    
    public UserPrincipal(String id, String email, String username, String password, 
                        Collection<? extends GrantedAuthority> authorities, 
                        boolean isActive, boolean isLocked) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.password = password;
        this.authorities = authorities;
        this.isActive = isActive;
        this.isLocked = isLocked;
    }
    
    public static UserPrincipal create(User user) {
        // Handle both regular users and admin users
        Collection<GrantedAuthority> authorities;
        
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            authorities = user.getRoles().stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                    .collect(Collectors.toList());
        } else {
            // Fallback to userRole if roles is null/empty
            String role = user.getUserRole() != null ? user.getUserRole() : "USER";
            authorities = Set.of(new SimpleGrantedAuthority("ROLE_" + role));
        }
        
        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getUsername(), // This may be null for regular users
                user.getPassword(),
                authorities,
                user.getIsActive() != null ? user.getIsActive() : true,
                user.getIsLocked() != null ? user.getIsLocked() : false
        );
    }
    
    public String getId() {
        return id;
    }
    
    public String getEmail() {
        return email;
    }
    
    public String getUsernameField() {
        return username;
    }
    
    @Override
    public String getUsername() {
        // For Spring Security, return the primary identifier
        // For admin users, prefer username; for regular users, use email
        return (username != null && !username.isEmpty()) ? username : email;
    }
    
    @Override
    public String getPassword() {
        return password;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return !isLocked;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return isActive;
    }
}
