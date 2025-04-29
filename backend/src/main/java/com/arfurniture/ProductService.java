package com.arfurniture;

import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;

public class ProductService {
    public void handleProducts(HttpExchange exchange) throws IOException {
        setCorsHeaders(exchange);
        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        try {
            String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendResponse(exchange, 401, "{\"error\":\"Unauthorized - No token provided\"}");
                return;
            }

            String token = authHeader.substring(7);
            if (!AuthService.validateToken(token)) {
                sendResponse(exchange, 401, "{\"error\":\"Invalid token\"}");
                return;
            }

            String productsJson = "["
                + "{\"id\":1,\"name\":\"Modern Bed\",\"price\":599.99,\"arModelUrl\":\"models/bed.glb\"},"
                + "{\"id\":2,\"name\":\"Corner Sofa\",\"price\":899.99,\"arModelUrl\":\"models/corner_sofa.glb\"},"
                + "{\"id\":3,\"name\":\"Antique Lantern\",\"price\":129.99,\"arModelUrl\":\"models/Lantern.glb\"}"
                + "]";
            
            sendResponse(exchange, 200, productsJson);
        } catch (Exception e) {
            sendResponse(exchange, 500, "{\"error\":\"Server error: " + e.getMessage() + "\"}");
        }
    }

    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(statusCode, response.getBytes().length);
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes());
        os.close();
    }

    private void setCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Authorization, Content-Type");
        exchange.getResponseHeaders().add("Access-Control-Allow-Credentials", "true");
        exchange.getResponseHeaders().add("Access-Control-Max-Age", "3600");
    }
}