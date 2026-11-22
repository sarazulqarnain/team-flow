public class Order {
    private final String id;
    private final String customerId;
    private final String garment;
    private final String tier;
    private final int quantity;
    private final double total;
    private final String deadline; 
    private String stage;

    public Order(String id, String customerId, String garment, String tier,
                 int quantity, double total, String deadline) {
        this.id = id;
        this.customerId = customerId;
        this.garment = garment;
        this.tier = tier;
        this.quantity = quantity;
        this.total = total;
        this.deadline = deadline;
        this.stage = "Cutting";
    }

    public String getId() { return id; }
    public String getCustomerId() { return customerId; }
    public String getGarment() { return garment; }
    public String getTier() { return tier; }
    public int getQuantity() { return quantity; }
    public double getTotal() { return total; }
    public String getDeadline() { return deadline; }
    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    
    public String toString() {
        return id + " | " + customerId + " | " + garment + " | " + tier + " | "
                + quantity + " | " + total + " | " + deadline + " | " + stage;
    }
}

