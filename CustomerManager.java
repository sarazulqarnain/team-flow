public class CustomerManager {
    private final Customer[] customers = new Customer[200];
    private int count = 0;

    public boolean addCustomer(Customer customer) {
        if (customer == null || isBlank(customer.getId()) || isBlank(customer.getName())
                || isBlank(customer.getCity()) || isBlank(customer.getPhone())) {
            return false;
        }
        if (findCustomer(customer.getId()) != null || count == customers.length) {
            return false;
        }
        customers[count++] = customer;
        return true;
    }

    public Customer findCustomer(String id) {
        if (id == null) return null;
        for (int i = 0; i < count; i++) {
            if (customers[i].getId().equalsIgnoreCase(id.trim())) return customers[i];
        }
        return null;
    }

    public Customer[] getAllCustomers() {
        Customer[] result = new Customer[count];
        for (int i = 0; i < count; i++) result[i] = customers[i];
        return result;
    }

    public int getCount() { return count; }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
