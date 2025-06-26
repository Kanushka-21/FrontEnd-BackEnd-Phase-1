package com.gemnet.security;

import com.gemnet.model.User;
import com.gemnet.service.UserService;
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

@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Autowired
    private UserService userService;
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        return UserPrincipal.create(user);
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
    private String password;
    private Collection<? extends GrantedAuthority> authorities;
    private boolean isActive;
    private boolean isLocked;
    
    public UserPrincipal(String id, String email, String password, 
                        Collection<? extends GrantedAuthority> authorities, 
                        boolean isActive, boolean isLocked) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
        this.isActive = isActive;
        this.isLocked = isLocked;
    }
    
    public static UserPrincipal create(User user) {
        Collection<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toList());
        
        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                authorities,
                user.getIsActive(),
                !user.getIsLocked()
        );
    }
    
    public String getId() {
        return id;
    }
    
    @Override
    public String getUsername() {
        return email;
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
