public class Customer {
    private final String id;
    private final String name;
    private final String city;
    private final String phone;

    public Customer(String id, String name, String city, String phone) {
        this.id = id;
        this.name = name;
        this.city = city;
        this.phone = phone;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getCity() { return city; }
    public String getPhone() { return phone; }

    @Override
    public String toString() {
        return id + " | " + name + " | " + city + " | " + phone;
    }
}
