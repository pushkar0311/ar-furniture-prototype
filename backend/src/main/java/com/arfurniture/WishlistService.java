package com.arfurniture;

import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class WishlistService {
    private static final Map<String, List<Integer>> userWishlists = new HashMap<>();

    public void handleWishlist(HttpExchange exchange) throws IOException {
        setCorsHeaders(exchange);
        
        // Handle OPTIONS preflight request
        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        try {
            // Verify authorization header
            String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendErrorResponse(exchange, 401, "Unauthorized - Missing token");
                return;
            }

            // Extract and validate token
            String token = authHeader.substring(7);
            if (!AuthService.validateToken(token)) {
                sendErrorResponse(exchange, 401, "Invalid token");
                return;
            }

            // Get user email from token
            String email = AuthService.getEmailByToken(token);
            if (email == null) {
                sendErrorResponse(exchange, 401, "Invalid user");
                return;
            }

            // Route requests based on method
            switch (exchange.getRequestMethod()) {
                case "GET":
                    handleGetWishlist(exchange, email);
                    break;
                case "POST":
                    handleAddToWishlist(exchange, email);
                    break;
                case "DELETE":
                    handleRemoveFromWishlist(exchange, email);
                    break;
                default:
                    sendErrorResponse(exchange, 405, "Method not allowed");
            }
        } catch (Exception e) {
            sendErrorResponse(exchange, 500, "Internal server error");
        }
    }

    private void handleGetWishlist(HttpExchange exchange, String email) throws IOException {
        List<Integer> wishlist = userWishlists.getOrDefault(email, new ArrayList<>());
        String response = String.format("{\"wishlist\":%s}", wishlist.toString());
        sendResponse(exchange, 200, response);
    }

    private void handleAddToWishlist(HttpExchange exchange, String email) throws IOException {
        String requestBody = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
        
        // Simple JSON parsing for productId
        if (!requestBody.contains("\"productId\":")) {
            sendErrorResponse(exchange, 400, "Invalid request format");
            return;
        }

        try {
            int productId = extractProductId(requestBody);
            userWishlists.computeIfAbsent(email, k -> new ArrayList<>());
            
            if (userWishlists.get(email).contains(productId)) {
                sendResponse(exchange, 200, "{\"status\":\"already_in_wishlist\"}");
            } else {
                userWishlists.get(email).add(productId);
                sendResponse(exchange, 200, "{\"status\":\"added\"}");
            }
        } catch (NumberFormatException e) {
            sendErrorResponse(exchange, 400, "Invalid product ID");
        }
    }

    private void handleRemoveFromWishlist(HttpExchange exchange, String email) throws IOException {
        String requestBody = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
        
        try {
            int productId = extractProductId(requestBody);
            List<Integer> wishlist = userWishlists.get(email);
            
            if (wishlist == null || !wishlist.remove(Integer.valueOf(productId))) {
                sendErrorResponse(exchange, 404, "Product not found in wishlist");
            } else {
                sendResponse(exchange, 200, "{\"status\":\"removed\"}");
            }
        } catch (NumberFormatException e) {
            sendErrorResponse(exchange, 400, "Invalid product ID");
        }
    }

    private int extractProductId(String requestBody) throws NumberFormatException {
        return Integer.parseInt(
            requestBody.split("\"productId\":")[1]
                .split("[,\\}]")[0]
                .trim()
        );
    }

    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(statusCode, response.getBytes().length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(response.getBytes());
        }
    }

    private void sendErrorResponse(HttpExchange exchange, int statusCode, String error) throws IOException {
        sendResponse(exchange, statusCode, String.format("{\"error\":\"%s\"}", error));
    }

    private void setCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
}