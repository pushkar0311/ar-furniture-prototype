package com.arfurniture;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;

public class Main {
    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8000), 0);
        
        server.createContext("/api/login", new AuthService()::handleLogin);
        server.createContext("/api/register", new AuthService()::handleRegister);
        server.createContext("/api/products", new ProductService()::handleProducts);
        server.createContext("/api/wishlist", new WishlistService()::handleWishlist);
        
        server.createContext("/", exchange -> {
            String response = "AR Furniture Prototype API";
            exchange.sendResponseHeaders(200, response.getBytes().length);
            exchange.getResponseBody().write(response.getBytes());
            exchange.getResponseBody().close();
        });
        
        server.setExecutor(null);
        server.start();
        System.out.println("Server running on port 8000");
    }
}