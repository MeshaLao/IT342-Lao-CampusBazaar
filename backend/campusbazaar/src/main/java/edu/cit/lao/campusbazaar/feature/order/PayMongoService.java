package edu.cit.lao.campusbazaar.feature.order;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Base64;
import java.util.Map;

@Service
public class PayMongoService {

    private final WebClient webClient;

    public PayMongoService(
            @Value("${paymongo.secret-key}") String secretKey,
            @Value("${paymongo.base-url}") String baseUrl) {
        String encoded = Base64.getEncoder()
                .encodeToString((secretKey + ":").getBytes());
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Basic " + encoded)
                .defaultHeader(HttpHeaders.CONTENT_TYPE,
                        MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public Map createPaymentLink(String orderNumber,
                                 double amount, String description) {
        long amountInCentavos = (long)(amount * 100);

        Map<String, Object> attributes = Map.of(
                "amount", amountInCentavos,
                "currency", "PHP",
                "description", description,
                "reference_number", orderNumber,
                "redirect", Map.of(
                        // PayMongo appends ?reference_number=ORDER-XXX to this URL
                        "success", "http://localhost:5173/payment/success",
                        "failed",  "http://localhost:5173/payment/failed"
                )
        );

        Map<String, Object> body = Map.of(
                "data", Map.of("attributes", attributes)
        );

        return webClient.post()
                .uri("/links")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    public Map getPaymentLinkStatus(String linkId) {
        return webClient.get()
                .uri("/links/" + linkId)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }
}