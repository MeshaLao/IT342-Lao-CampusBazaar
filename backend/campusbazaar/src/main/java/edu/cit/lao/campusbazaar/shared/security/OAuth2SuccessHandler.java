package edu.cit.lao.campusbazaar.shared.security;

import edu.cit.lao.campusbazaar.feature.user.model.User;
import edu.cit.lao.campusbazaar.feature.user.UserRepository;
import edu.cit.lao.campusbazaar.shared.config.EmailService;
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
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

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
                getRedirectStrategy().sendRedirect(request, response,
                        frontendUrl + "/login?error=oauth_failed");
                return;
            }

            boolean isNewUser = !userRepository.existsByEmail(email);

            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        String[] parts = (name != null) ? name.split(" ", 2) : new String[]{"User", ""};
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

            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                userRepository.save(user);
            }

            // Send welcome email only for brand new users
            if (isNewUser) {
                String displayName = user.getFullName() != null
                        ? user.getFullName()
                        : (user.getFirstName() + " " + user.getLastName()).trim();
                emailService.sendWelcomeEmail(email, displayName);
            }

            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

            String fullName = user.getFullName() != null
                    ? user.getFullName()
                    : (user.getFirstName() + " " + user.getLastName()).trim();

            String redirectUrl = frontendUrl + "/oauth2/callback"
                    + "?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8)
                    + "&name="  + URLEncoder.encode(fullName, StandardCharsets.UTF_8)
                    + "&email=" + URLEncoder.encode(email, StandardCharsets.UTF_8)
                    + "&role="  + URLEncoder.encode(user.getRole().name(), StandardCharsets.UTF_8);

            System.out.println("Redirecting to: " + redirectUrl);
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);

        } catch (Exception e) {
            System.out.println("=== OAuth2 ERROR ===");
            e.printStackTrace();
            getRedirectStrategy().sendRedirect(request, response,
                    frontendUrl + "/login?error=oauth_failed");
        }
    }
}
