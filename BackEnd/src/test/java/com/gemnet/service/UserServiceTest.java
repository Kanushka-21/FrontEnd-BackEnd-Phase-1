package com.gemnet.service;

import com.gemnet.dto.UserRegistrationRequest;
import com.gemnet.dto.LoginRequest;
import com.gemnet.dto.ApiResponse;
import com.gemnet.dto.AuthenticationResponse;
import com.gemnet.model.User;
import com.gemnet.repository.UserRepository;
import com.gemnet.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;
import java.util.HashSet;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private FaceRecognitionService faceRecognitionService;

    @Mock
    private NicVerificationService nicVerificationService;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private UserService userService;

    private UserRegistrationRequest validRegistrationRequest;
    private LoginRequest validLoginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        validRegistrationRequest = new UserRegistrationRequest(
                "John",
                "Doe",
                "john.doe@example.com",
                "password123",
                "+94771234567",
                "123 Main St, Colombo",
                "1990-01-01",
                "901234567V"
        );

        validLoginRequest = new LoginRequest("john.doe@example.com", "password123");

        testUser = new User(
                "John",
                "Doe",
                "john.doe@example.com",
                "encoded-password",
                "+94771234567",
                "123 Main St, Colombo",
                "1990-01-01",
                "901234567V"
        );
        testUser.setId("test-user-id");
        Set<String> roles = new HashSet<>();
        roles.add("USER");
        testUser.setRoles(roles);
    }

    @Test
    void shouldRegisterNewUserSuccessfully() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByNicNumber(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        ApiResponse<String> response = userService.registerUser(validRegistrationRequest);

        // Then
        assertTrue(response.isSuccess());
        assertEquals("User registered successfully. Proceed to face verification.", response.getMessage());
        assertEquals("test-user-id", response.getData());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldRejectRegistrationWhenEmailExists() {
        // Given
        when(userRepository.existsByEmail(validRegistrationRequest.getEmail())).thenReturn(true);

        // When
        ApiResponse<String> response = userService.registerUser(validRegistrationRequest);

        // Then
        assertFalse(response.isSuccess());
        assertEquals("Email already registered", response.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldRejectRegistrationWhenNicExists() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByNicNumber(validRegistrationRequest.getNicNumber())).thenReturn(true);

        // When
        ApiResponse<String> response = userService.registerUser(validRegistrationRequest);

        // Then
        assertFalse(response.isSuccess());
        assertEquals("NIC number already registered", response.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldLoginUserSuccessfully() {
        // Given
        when(userRepository.findByEmailAndIsActive(validLoginRequest.getEmail(), true))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(validLoginRequest.getPassword(), testUser.getPassword()))
                .thenReturn(true);
        when(jwtTokenProvider.generateToken(testUser.getEmail())).thenReturn("jwt-token");

        // When
        ApiResponse<AuthenticationResponse> response = userService.loginUser(validLoginRequest);

        // Then
        assertTrue(response.isSuccess());
        assertEquals("Login successful", response.getMessage());
        assertNotNull(response.getData());
        assertEquals("jwt-token", response.getData().getToken());
        assertEquals(testUser.getEmail(), response.getData().getEmail());
    }

    @Test
    void shouldRejectLoginWithInvalidCredentials() {
        // Given
        when(userRepository.findByEmailAndIsActive(validLoginRequest.getEmail(), true))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(validLoginRequest.getPassword(), testUser.getPassword()))
                .thenReturn(false);

        // When
        ApiResponse<AuthenticationResponse> response = userService.loginUser(validLoginRequest);

        // Then
        assertFalse(response.isSuccess());
        assertEquals("Invalid email or password", response.getMessage());
        assertNull(response.getData());
    }

    @Test
    void shouldRejectLoginWhenUserNotFound() {
        // Given
        when(userRepository.findByEmailAndIsActive(validLoginRequest.getEmail(), true))
                .thenReturn(Optional.empty());

        // When
        ApiResponse<AuthenticationResponse> response = userService.loginUser(validLoginRequest);

        // Then
        assertFalse(response.isSuccess());
        assertEquals("Invalid email or password", response.getMessage());
        assertNull(response.getData());
    }

    @Test
    void shouldRejectLoginWhenAccountIsLocked() {
        // Given
        testUser.setIsLocked(true);
        when(userRepository.findByEmailAndIsActive(validLoginRequest.getEmail(), true))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(validLoginRequest.getPassword(), testUser.getPassword()))
                .thenReturn(true);

        // When
        ApiResponse<AuthenticationResponse> response = userService.loginUser(validLoginRequest);

        // Then
        assertFalse(response.isSuccess());
        assertEquals("Account is locked. Please contact support.", response.getMessage());
        assertNull(response.getData());
    }
}
