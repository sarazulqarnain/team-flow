public class ShipmentManager {
    private final OrderManager orderManager;
    private final CustomerManager customerManager;

    public ShipmentManager(OrderManager orderManager, CustomerManager customerManager) {
        this.orderManager = orderManager;
        this.customerManager = customerManager;
    }

    public Order[] getShipmentOrdersByCity() {
        Order[] orders = orderManager.getAllOrders();
        SelectionSorter.sortByCity(orders, customerManager);
        return orders;
    }

    public String getDestinationCity(Order order) {
        Customer customer = customerManager.findCustomer(order.getCustomerId());
        return customer == null ? "Unknown" : customer.getCity();
    }
}

