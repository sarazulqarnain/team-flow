public class PaymentManager {
    public static class Payment {
        private final String orderId;
        private final String type;
        private final double amount;
        private final String date;
        public Payment(String orderId, String type, double amount, String date) {
            this.orderId = orderId; this.type = type; this.amount = amount; this.date = date;
        }
        public String getOrderId() { return orderId; }
        public String getType() { return type; }
        public double getAmount() { return amount; }
        public String getDate() { return date; }
    }

    private final Payment[] payments = new Payment[1000];
    private int count = 0;
    private final OrderManager orderManager;

    public PaymentManager(OrderManager orderManager) { this.orderManager = orderManager; }

    public boolean recordPayment(String orderId, String type, double amount, String date) {
        Order order = orderManager.findOrder(orderId);
        if (order == null || amount <= 0 || date == null || date.trim().isEmpty()
                || !("Advance".equalsIgnoreCase(type) || "Final".equalsIgnoreCase(type))
                || count == payments.length || amount > getBalance(orderId)) return false;
        payments[count++] = new Payment(orderId, type, amount, date);
        return true;
    }

    public double getPaidAmount(String orderId) {
        double total = 0;
        for (int i = 0; i < count; i++) {
            if (payments[i].getOrderId().equalsIgnoreCase(orderId)) total += payments[i].getAmount();
        }
        return total;
    }

    public double getBalance(String orderId) {
        Order order = orderManager.findOrder(orderId);
        return order == null ? 0 : order.getTotal() - getPaidAmount(orderId);
    }

    public Payment[] getPayments() {
        Payment[] result = new Payment[count];
        for (int i = 0; i < count; i++) result[i] = payments[i];
        return result;
    }
}
