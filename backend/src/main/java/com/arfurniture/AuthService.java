package com.arfurniture;

import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

public class AuthService {
    private static Map<String, String> users = new HashMap<>();
    private static Map<String, String> tokens = new HashMap<>();

    public void handleLogin(HttpExchange exchange) throws IOException {
        setCorsHeaders(exchange);
        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        try {
            String requestBody = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            String[] parts = requestBody.split("&");
            String email = URLDecoder.decode(parts[0].split("=")[1], StandardCharsets.UTF_8);
            String password = URLDecoder.decode(parts[1].split("=")[1], StandardCharsets.UTF_8);

            if (users.containsKey(email) && users.get(email).equals(password)) {
                String token = UUID.randomUUID().toString();
                tokens.put(token, email);
                sendResponse(exchange, 200, "{\"token\":\"" + token + "\"}");
            } else {
                sendResponse(exchange, 401, "{\"error\":\"Invalid credentials\"}");
            }
        } catch (Exception e) {
            sendResponse(exchange, 400, "{\"error\":\"Invalid request: " + e.getMessage() + "\"}");
        }
    }

    public void handleRegister(HttpExchange exchange) throws IOException {
        setCorsHeaders(exchange);
        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        try {
            String requestBody = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            String[] parts = requestBody.split("&");
            String email = URLDecoder.decode(parts[0].split("=")[1], StandardCharsets.UTF_8);
            String password = URLDecoder.decode(parts[1].split("=")[1], StandardCharsets.UTF_8);

            if (users.containsKey(email)) {
                sendResponse(exchange, 400, "{\"error\":\"User already exists\"}");
            } else {
                users.put(email, password);
                sendResponse(exchange, 201, "{\"message\":\"User registered\"}");
            }
        } catch (Exception e) {
            sendResponse(exchange, 400, "{\"error\":\"Invalid request: " + e.getMessage() + "\"}");
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
        // Updated with your specific frontend origin and enhanced security
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "http://192.168.116.227:3000");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
        exchange.getResponseHeaders().add("Access-Control-Allow-Credentials", "true");
        exchange.getResponseHeaders().add("Access-Control-Max-Age", "3600");
    }

    public static boolean validateToken(String token) {
        return tokens.containsKey(token);
    }

    public static String getEmailByToken(String token) {
        return tokens.get(token);
    }
}

