package com.zerox.csm.controllers;

import com.zerox.csm.dto.AuthDto.AuthResponse;
import com.zerox.csm.dto.AuthDto.LoginRequest;
import com.zerox.csm.dto.AuthDto.RegisterRequest;
import com.zerox.csm.dto.UserDto;
import com.zerox.csm.dto.UserDto.UserProfileResponse;
import com.zerox.csm.exception.PasswordChangeException;
import com.zerox.csm.model.User;
import com.zerox.csm.repository.UserRepository;
import com.zerox.csm.security.JwtService;
import com.zerox.csm.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;



    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }


    //This is the endpoint to get the user profile details read from the database
    //localhost:8080/api/auth/myprofile
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.getUserProfile(userDetails.getUsername()));
    }




    //This is the endpoint to update the user profile details to the database
    //localhost:8080/api/auth/myprofile
//    @PutMapping("/myprofile")
//    public ResponseEntity<UserDto.UserProfileResponse> updateProfile(
//            @AuthenticationPrincipal UserDetails userDetails,
//            @Valid @RequestBody UserDto.UserUpdateRequest request) {
//        return ResponseEntity.ok(authService.updateUserProfile(userDetails.getUsername(), request));
//    }
//    @PutMapping("/profile")
//    public ResponseEntity<UserProfileResponse> updateProfile(
//            @AuthenticationPrincipal UserDetails userDetails,
//            @Valid @RequestBody UserDto.UserUpdateRequest request) {
//
//        // Validate email change if needed
//        UserRepository userRepository = null;
//        if (!userDetails.getUsername().equals(request.email()) &&
//                userRepository.findByEmail(request.email()).isPresent()) {
//            throw new IllegalArgumentException("Email already in use");
//        }
//
//        UserProfileResponse updatedProfile = authService.updateUserProfile(
//                userDetails.getUsername(),
//                request
//        );
//
//        return ResponseEntity.ok(updatedProfile);
//    }

  /*  // This is working but once change email it doesn't work(Not update again)
    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserDto.UserUpdateRequest request) {

        // Remove this line: UserRepository userRepository = null;

        // Use the repository through authService instead
        if (!userDetails.getUsername().equals(request.email()) &&
                authService.userExistsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already in use");
        }

        UserProfileResponse updatedProfile = authService.updateUserProfile(
                userDetails.getUsername(),
                request
        );

        return ResponseEntity.ok(updatedProfile);
    }*/
  @PutMapping("/profile")
  public ResponseEntity<UserProfileResponse> updateProfile(
          @AuthenticationPrincipal UserDetails userDetails,
          @Valid @RequestBody UserDto.UserUpdateRequest request) {

      // Get current user from database
      User currentUser = authService.getUserByEmail(userDetails.getUsername());

      // Verify user is updating their own profile
      if (!currentUser.getUserId().equals(request.userId())) {
          throw new IllegalArgumentException("Can only update your own profile");
      }

      // Check if email is being changed to an existing one
      if (!currentUser.getEmail().equals(request.email()) &&
              authService.userExistsByEmail(request.email())) {
          throw new IllegalArgumentException("Email already in use");
      }

      return ResponseEntity.ok(authService.updateUserProfile(request.userId(), request));
  }



/*    @PostMapping("/changepassword")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserDto.PasswordChangeRequest request
    ) {
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.noContent().build();
    }*/

    @PostMapping("/changepassword")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserDto.PasswordChangeRequest request) {

        try {
            authService.changePassword(userDetails.getUsername(), request);
            return ResponseEntity.noContent().build();
        } catch (PasswordChangeException e) {
            throw e; // Will be handled by GlobalExceptionHandler
        } catch (Exception e) {
            throw new PasswordChangeException("Password change failed. Please try again.");
        }
    }



    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // Since JWT is stateless, server-side logout isn't strictly necessary
        // But you could implement token blacklisting if needed
        return ResponseEntity.noContent().build();
    }
}
