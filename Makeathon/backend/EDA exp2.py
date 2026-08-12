import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer

# Step 1: Create a sample dataset with missing values
data = {
    "Age": [25, np.nan, 28, 35, np.nan, 40],
    "Salary": [50000, 54000, np.nan, 58000, 60000, np.nan],
    "Department": ["HR", "HR", "IT", np.nan, "Finance", "Finance"]
}

# Create DataFrame
df = pd.DataFrame(data)

print("Original Data:\n")
print(df)

# Step 2: Show missing values before imputation
print("\nMissing Values (Before Imputation):")
print(df.isnull().sum())

# Step 3: Mean imputation for numeric columns
mean_imputer = SimpleImputer(strategy="mean")

df["Age_mean"] = mean_imputer.fit_transform(df[["Age"]]).ravel()
df["Salary_mean"] = mean_imputer.fit_transform(df[["Salary"]]).ravel()

# Step 4: Median imputation for numeric columns
median_imputer = SimpleImputer(strategy="median")

df["Age_median"] = median_imputer.fit_transform(df[["Age"]]).ravel()
df["Salary_median"] = median_imputer.fit_transform(df[["Salary"]]).ravel()

# Step 5: Most frequent imputation for categorical column
freq_imputer = SimpleImputer(strategy="most_frequent")

df["Department_mode"] = freq_imputer.fit_transform(df[["Department"]]).ravel()

# Step 6: Show missing values after imputation
print("\nMissing Values (After Imputation):")
print(
    df[
        [
            "Age_mean",
            "Salary_mean",
            "Age_median",
            "Salary_median",
            "Department_mode",
        ]
    ].isnull().sum()
)

# Step 7: Export final data to CSV
df.to_csv("imputed_data.csv", index=False)

print("\nFinal Data exported to 'imputed_data.csv'")

# Step 8: Display final DataFrame
print("\nFinal DataFrame:\n")
print(df)