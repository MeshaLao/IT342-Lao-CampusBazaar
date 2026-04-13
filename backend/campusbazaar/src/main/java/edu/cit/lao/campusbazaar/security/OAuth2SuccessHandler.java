package edu.cit.lao.campusbazaar.security;

import edu.cit.lao.campusbazaar.model.User;
import edu.cit.lao.campusbazaar.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

            // Log all attributes for debugging
            System.out.println("=== OAuth2 SUCCESS ===");
            System.out.println("Attributes: " + oAuth2User.getAttributes());

            String email    = oAuth2User.getAttribute("email");
            String name     = oAuth2User.getAttribute("name");
            String googleId = oAuth2User.getAttribute("sub");

            System.out.println("Email: " + email);
            System.out.println("Name: " + name);
            System.out.println("GoogleId: " + googleId);
            System.out.println("FrontendUrl: " + frontendUrl);

            if (email == null) {
                System.out.println("EMAIL IS NULL - redirecting to error");
                getRedirectStrategy().sendRedirect(
                        request, response,
                        frontendUrl + "/login?error=oauth_failed");
                return;
            }

            // Find existing user or create new one
            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        String[] parts = (name != null)
                                ? name.split(" ", 2)
                                : new String[]{"User", ""};

                        User newUser = User.builder()
                                .email(email)
                                .fullName(name != null ? name : email)
                                .firstName(parts[0])
                                .lastName(parts.length > 1 ? parts[1] : "")
                                .googleId(googleId)
                                .role(User.Role.STUDENT)
                                .suspended(false)
                                .createdAt(LocalDateTime.now())
                                .build();

                        return userRepository.save(newUser);
                    });

            // Link Google ID if not yet linked
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                userRepository.save(user);
            }

            // Generate JWT
            String token = jwtUtil.generateToken(
                    user.getEmail(), user.getRole().name());

            System.out.println("Token generated: " + (token != null));

            String fullName = user.getFullName() != null
                    ? user.getFullName()
                    : (user.getFirstName() + " " + user.getLastName()).trim();

            // Build redirect URL
            String redirectUrl = frontendUrl + "/oauth2/callback"
                    + "?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8)
                    + "&name="  + URLEncoder.encode(fullName, StandardCharsets.UTF_8)
                    + "&email=" + URLEncoder.encode(email, StandardCharsets.UTF_8)
                    + "&role="  + URLEncoder.encode(
                    user.getRole().name(), StandardCharsets.UTF_8);

            System.out.println("Redirecting to: " + redirectUrl);

            getRedirectStrategy().sendRedirect(request, response, redirectUrl);

        } catch (Exception e) {
            System.out.println("=== OAuth2 ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            getRedirectStrategy().sendRedirect(
                    request, response,
                    frontendUrl + "/login?error=oauth_failed");
        }
    }
}