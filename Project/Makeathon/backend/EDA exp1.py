import pandas as pd
from dataclasses import dataclass

# Define the Product class
@dataclass
class Product:
    name: str
    category: str
    price: float

# Sample product data
products = [
    Product("Laptop", "Electronics", 1000),
    Product("T-shirt", "Clothing", 20),
    Product("Book", "Books", 15),
    Product("Headphones", "Electronics", 100),
    Product("Jeans", "Clothing", 50),
    Product("Smartphone", "Electronics", 800),
    Product("Sunglasses", "Accessories", 30),
    Product("Watch", "Accessories", 50),
    Product("Shoes", "Footwear", 80),
]

# Define dates and countries
dates = ["2023-05-01", "2023-05-02", "2023-05-03"]
countries = ["USA", "UK", "Germany"]

# Generate the full dataset
data = []
for product in products:
    for date in dates:
        for country in countries:
            data.append({
                "Category": product.category,
                "Product": product.name,
                "Date": date,
                "Country": country,
                "Price": product.price
            })

# Convert to DataFrame
df = pd.DataFrame(data)

# Create a pivot table (3D Data Cube)
data_cube = pd.pivot_table(
    df,
    values="Price",
    index=["Category", "Product"],
    columns=["Date", "Country"],
    aggfunc="first"
)

print("Original Dataset:\n")
print(df)

print("\n3D Data Cube (Product × Date × Country):\n")
print(data_cube)