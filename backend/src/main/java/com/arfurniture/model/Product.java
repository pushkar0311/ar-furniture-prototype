package com.arfurniture.model;

public class Product {
    private int id;
    private String name;
    private double price;
    private String arModelUrl;

    public Product(int id, String name, double price, String arModelUrl) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.arModelUrl = arModelUrl;
    }

    // Getters and setters
    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public double getPrice() {
        return price;
    }

    public String getArModelUrl() {
        return arModelUrl;
    }
}