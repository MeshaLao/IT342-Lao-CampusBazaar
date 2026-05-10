package edu.cit.lao.campusbazaar.shared.config;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private void sendHtml(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            System.out.println("Email failed: " + e.getMessage());
        }
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String fullName) {
        String html = "<div style=\"font-family: Georgia, serif; background-color: #E8E4C9; padding: 40px 0;\">"
                + "<div style=\"max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;\">"
                + "<div style=\"background-color: #1D5D5D; padding: 36px 40px; text-align: center;\">"
                + "<p style=\"margin: 0 0 4px 0; font-size: 22px; font-weight: bold; letter-spacing: 4px; color: #B28E3A;\">CAMPUSBAZAAR</p>"
                + "<p style=\"margin: 0; font-size: 12px; color: #E8E4C9; letter-spacing: 2px;\">THE STUDENT SOUK</p>"
                + "</div>"
                + "<div style=\"padding: 40px;\">"
                + "<p style=\"font-size: 20px; font-weight: bold; color: #421C3B; margin: 0 0 8px;\">Welcome, " + fullName + "!</p>"
                + "<p style=\"font-size: 14px; color: #6b7280; margin: 0 0 28px; line-height: 1.6;\">Your account has been created successfully. You are now part of the Campus Bazaar community!</p>"
                + "<div style=\"border-top: 1px solid #E8E4C9; margin-bottom: 28px;\"></div>"
                + "<p style=\"font-size: 13px; font-weight: bold; color: #1D5D5D; letter-spacing: 1px; margin: 0 0 16px;\">WHAT YOU CAN DO</p>"
                + "<p style=\"font-size: 14px; color: #421C3B; margin: 0 0 6px;\"><b>Browse the Marketplace</b></p>"
                + "<p style=\"font-size: 13px; color: #6b7280; margin: 0 0 14px;\">Discover products listed by fellow students on campus.</p>"
                + "<p style=\"font-size: 14px; color: #421C3B; margin: 0 0 6px;\"><b>Sell Your Items</b></p>"
                + "<p style=\"font-size: 13px; color: #6b7280; margin: 0 0 14px;\">List products with images and manage your own store.</p>"
                + "<p style=\"font-size: 14px; color: #421C3B; margin: 0 0 6px;\"><b>Pay Your Way</b></p>"
                + "<p style=\"font-size: 13px; color: #6b7280; margin: 0 0 28px;\">Choose online payment or cash meetup.</p>"
                + "<div style=\"text-align: center; margin-bottom: 32px;\">"
                + "<a href=\"" + frontendUrl + "\" style=\"display: inline-block; background-color: #1D5D5D; color: #E8E4C9; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 14px; font-weight: bold; letter-spacing: 1px;\">VISIT CAMPUS BAZAAR</a>"
                + "</div>"
                + "<div style=\"border-top: 1px solid #E8E4C9; padding-top: 20px;\">"
                + "<p style=\"font-size: 12px; color: #9ca3af; text-align: center; margin: 0;\">You received this because you registered at Campus Bazaar. Cebu Institute of Technology - IT342</p>"
                + "</div></div>"
                + "<div style=\"background-color: #421C3B; padding: 20px 40px; text-align: center;\">"
                + "<p style=\"margin: 0; font-size: 12px; color: #B28E3A; letter-spacing: 2px;\">THE STUDENT SOUK - CAMPUS BAZAAR</p>"
                + "</div></div></div>";
        sendHtml(toEmail, "Welcome to Campus Bazaar!", html);
    }

    @Async
    public void sendOrderConfirmationEmail(String toEmail, String buyerName,
                                           String orderNumber, String productName,
                                           String paymentMethod, Double totalAmount) {
        String methodNote = paymentMethod.equals("MEETUP")
                ? "A QR code has been generated. Show it to the seller upon collection."
                : "Please complete your payment to confirm the order.";

        String html = "<div style=\"font-family: Georgia, serif; background-color: #E8E4C9; padding: 40px 0;\">"
                + "<div style=\"max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;\">"
                + "<div style=\"background-color: #1D5D5D; padding: 36px 40px; text-align: center;\">"
                + "<p style=\"margin: 0 0 4px 0; font-size: 22px; font-weight: bold; letter-spacing: 4px; color: #B28E3A;\">CAMPUSBAZAAR</p>"
                + "<p style=\"margin: 0; font-size: 12px; color: #E8E4C9; letter-spacing: 2px;\">THE STUDENT SOUK</p>"
                + "</div>"
                + "<div style=\"padding: 40px;\">"
                + "<p style=\"font-size: 20px; font-weight: bold; color: #421C3B; margin: 0 0 6px;\">Order Confirmed!</p>"
                + "<p style=\"font-size: 14px; color: #6b7280; margin: 0 0 28px;\">Hi " + buyerName + ", your order has been placed successfully.</p>"
                + "<div style=\"background-color: #f9f7f0; border: 1px solid #E8E4C9; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px;\">"
                + "<table style=\"width: 100%; font-size: 13px; border-collapse: collapse;\">"
                + "<tr><td style=\"color: #6b7280; padding: 6px 0;\">Order Number</td><td style=\"color: #421C3B; font-weight: bold; text-align: right;\">" + orderNumber + "</td></tr>"
                + "<tr><td style=\"color: #6b7280; padding: 6px 0;\">Product</td><td style=\"color: #421C3B; font-weight: bold; text-align: right;\">" + productName + "</td></tr>"
                + "<tr><td style=\"color: #6b7280; padding: 6px 0;\">Payment</td><td style=\"color: #421C3B; font-weight: bold; text-align: right;\">" + paymentMethod + "</td></tr>"
                + "<tr><td style=\"color: #6b7280; padding: 6px 0; border-top: 1px solid #E8E4C9;\">Total</td>"
                + "<td style=\"color: #1D5D5D; font-weight: bold; text-align: right; font-size: 16px; border-top: 1px solid #E8E4C9;\">P" + String.format("%.2f", totalAmount) + "</td></tr>"
                + "</table></div>"
                + "<p style=\"font-size: 13px; color: #6b7280; margin: 0 0 28px;\">" + methodNote + "</p>"
                + "<div style=\"text-align: center; margin-bottom: 32px;\">"
                + "<a href=\"" + frontendUrl + "/my-orders\" style=\"display: inline-block; background-color: #1D5D5D; color: #E8E4C9; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 14px; font-weight: bold; letter-spacing: 1px;\">TRACK MY ORDER</a>"
                + "</div>"
                + "<div style=\"border-top: 1px solid #E8E4C9; padding-top: 20px;\">"
                + "<p style=\"font-size: 12px; color: #9ca3af; text-align: center; margin: 0;\">Campus Bazaar - Cebu Institute of Technology - IT342</p>"
                + "</div></div>"
                + "<div style=\"background-color: #421C3B; padding: 20px 40px; text-align: center;\">"
                + "<p style=\"margin: 0; font-size: 12px; color: #B28E3A; letter-spacing: 2px;\">THE STUDENT SOUK - CAMPUS BAZAAR</p>"
                + "</div></div></div>";
        sendHtml(toEmail, "Order Confirmed - " + orderNumber, html);
    }

    @Async
    public void sendSellerNotificationEmail(String toEmail, String sellerName,
                                            String orderNumber, String productName,
                                            String buyerName, String paymentMethod) {
        String html = "<div style=\"font-family: Georgia, serif; background-color: #E8E4C9; padding: 40px 0;\">"
                + "<div style=\"max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden;\">"
                + "<div style=\"background-color: #1D5D5D; padding: 36px 40px; text-align: center;\">"
                + "<p style=\"margin: 0 0 4px 0; font-size: 22px; font-weight: bold; letter-spacing: 4px; color: #B28E3A;\">CAMPUSBAZAAR</p>"
                + "<p style=\"margin: 0; font-size: 12px; color: #E8E4C9; letter-spacing: 2px;\">THE STUDENT SOUK</p>"
                + "</div>"
                + "<div style=\"padding: 40px;\">"
                + "<p style=\"font-size: 20px; font-weight: bold; color: #421C3B; margin: 0 0 6px;\">New Order Received!</p>"
                + "<p style=\"font-size: 14px; color: #6b7280; margin: 0 0 28px;\">Hi " + sellerName + ", someone just ordered your product!</p>"
                + "<div style=\"background-color: #f9f7f0; border: 1px solid #E8E4C9; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px;\">"
                + "<table style=\"width: 100%; font-size: 13px; border-collapse: collapse;\">"
                + "<tr><td style=\"color: #6b7280; padding: 6px 0;\">Order Number</td><td style=\"color: #421C3B; font-weight: bold; text-align: right;\">" + orderNumber + "</td></tr>"
                + "<tr><td style=\"color: #6b7280; padding: 6px 0;\">Product</td><td style=\"color: #421C3B; font-weight: bold; text-align: right;\">" + productName + "</td></tr>"
                + "<tr><td style=\"color: #6b7280; padding: 6px 0;\">Buyer</td><td style=\"color: #421C3B; font-weight: bold; text-align: right;\">" + buyerName + "</td></tr>"
                + "<tr><td style=\"color: #6b7280; padding: 6px 0;\">Payment</td><td style=\"color: #421C3B; font-weight: bold; text-align: right;\">" + paymentMethod + "</td></tr>"
                + "</table></div>"
                + "<div style=\"text-align: center; margin-bottom: 32px;\">"
                + "<a href=\"" + frontendUrl + "/dashboard\" style=\"display: inline-block; background-color: #421C3B; color: #E8E4C9; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 14px; font-weight: bold; letter-spacing: 1px;\">VIEW IN DASHBOARD</a>"
                + "</div>"
                + "<div style=\"border-top: 1px solid #E8E4C9; padding-top: 20px;\">"
                + "<p style=\"font-size: 12px; color: #9ca3af; text-align: center; margin: 0;\">Campus Bazaar - Cebu Institute of Technology - IT342</p>"
                + "</div></div>"
                + "<div style=\"background-color: #421C3B; padding: 20px 40px; text-align: center;\">"
                + "<p style=\"margin: 0; font-size: 12px; color: #B28E3A; letter-spacing: 2px;\">THE STUDENT SOUK - CAMPUS BAZAAR</p>"
                + "</div></div></div>";
        sendHtml(toEmail, "New Order Received - " + orderNumber, html);
    }
}