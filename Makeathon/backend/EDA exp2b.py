import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from scipy.signal import medfilt
from sklearn.linear_model import RANSACRegressor, LinearRegression

# -------------------------------
# 1. Define Functions
# -------------------------------

# Remove outliers using Mean and Standard Deviation
def remove_outliers(data, threshold=2.0):
    mean = np.mean(data)
    std = np.std(data)

    filtered = [
        x if abs(x - mean) <= threshold * std else np.nan
        for x in data
    ]

    return np.array(filtered)


# Apply Median Filter
def apply_median_filter(data, filter_size=5):
    return medfilt(data, kernel_size=filter_size)


# Apply Moving Average
def apply_moving_average(data, window_size=5):
    return (
        pd.Series(data)
        .rolling(window=window_size, center=True, min_periods=1)
        .mean()
        .to_numpy()
    )


# Robust Regression using RANSAC
def perform_robust_regression(x, y):

    x = x.reshape(-1, 1)

    model = RANSACRegressor(
        estimator=LinearRegression(),
        residual_threshold=10,
        random_state=42
    )

    model.fit(x, y)

    inlier_mask = model.inlier_mask_
    outlier_mask = ~inlier_mask

    return (
        x[inlier_mask],
        y[inlier_mask],
        x[outlier_mask],
        y[outlier_mask]
    )


# Simple Kalman Filter
def apply_kalman_filter(data, measurement_noise=4, process_noise=0.5):

    n = len(data)

    x_est = np.zeros(n)
    p = np.zeros(n)

    x_est[0] = data[0]
    p[0] = 1

    for k in range(1, n):

        x_pred = x_est[k - 1]
        p_pred = p[k - 1] + process_noise

        k_gain = p_pred / (p_pred + measurement_noise)

        x_est[k] = x_pred + k_gain * (data[k] - x_pred)

        p[k] = (1 - k_gain) * p_pred

    return x_est


# -------------------------------
# 2. Generate Noisy Data
# -------------------------------

np.random.seed(42)

x = np.linspace(0, 10, 100)

true_y = 3 * x + 5

noise = np.random.normal(0, 5, size=x.shape)

y = true_y + noise

# Add Outliers
y[::10] += 30

# -------------------------------
# 3. Apply Noise Handling Methods
# -------------------------------

filtered_outliers = remove_outliers(y)

filtered_median = apply_median_filter(y)

smoothed_avg = apply_moving_average(y)

inlier_x, inlier_y, outlier_x, outlier_y = perform_robust_regression(x, y)

filtered_kalman = apply_kalman_filter(y)

# -------------------------------
# 4. Print Results
# -------------------------------

print("Original Data (first 10 values):")
print(y[:10])

print("\nOutlier Removed:")
print(filtered_outliers[:10])

print("\nMedian Filter:")
print(filtered_median[:10])

print("\nMoving Average:")
print(smoothed_avg[:10])

print("\nKalman Filter:")
print(filtered_kalman[:10])

print(f"\nRobust Regression:")
print(f"Inliers : {len(inlier_x)}")
print(f"Outliers: {len(outlier_x)}")

# -------------------------------
# 5. Plot Results
# -------------------------------

plt.figure(figsize=(12, 8))

plt.plot(x, y, "k.", label="Noisy Data")

plt.plot(x, filtered_outliers, "ro", label="Outlier Removed")

plt.plot(x, filtered_median, "g-", linewidth=2, label="Median Filter")

plt.plot(x, smoothed_avg, "b-", linewidth=2, label="Moving Average")

plt.plot(x, filtered_kalman, "m-", linewidth=2, label="Kalman Filter")

plt.scatter(
    inlier_x,
    inlier_y,
    color="cyan",
    label="RANSAC Inliers"
)

plt.scatter(
    outlier_x,
    outlier_y,
    color="yellow",
    marker="x",
    label="RANSAC Outliers"
)

plt.title("Noise Handling Mechanisms")

plt.xlabel("X")

plt.ylabel("Y")

plt.legend()

plt.grid(True)

plt.show()