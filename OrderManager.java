public class OrderManager {
    private final Order[] orders = new Order[500];
    private int count = 0;
    private final CustomerManager customerManager;

    public OrderManager(CustomerManager customerManager) {
        this.customerManager = customerManager;
    }

    public boolean addOrder(Order order) {
        if (order == null || blank(order.getId()) || blank(order.getCustomerId())
                || blank(order.getGarment()) || blank(order.getDeadline())
                || order.getQuantity() <= 0 || order.getTotal() <= 0
                || customerManager.findCustomer(order.getCustomerId()) == null
                || findOrder(order.getId()) != null || count == orders.length
                || !validTier(order.getTier()) || !validDate(order.getDeadline())) {
            return false;
        }
        orders[count++] = order;
        return true;
    }

    public Order findOrder(String id) {
        if (id == null) return null;
        for (int i = 0; i < count; i++) {
            if (orders[i].getId().equalsIgnoreCase(id.trim())) return orders[i];
        }
        return null;
    }

    public Order[] getAllOrders() {
        Order[] result = new Order[count];
        for (int i = 0; i < count; i++) result[i] = orders[i];
        return result;
    }

    public int getCount() { return count; }

    private boolean validTier(String tier) {
        return tier != null && (tier.equalsIgnoreCase("Economy")
                || tier.equalsIgnoreCase("Standard") || tier.equalsIgnoreCase("Premium"));
    }

    private boolean validDate(String date) {
        try { java.time.LocalDate.parse(date); return true; }
        catch (Exception ex) { return false; }
    }

    private boolean blank(String value) { return value == null || value.trim().isEmpty(); }
}
