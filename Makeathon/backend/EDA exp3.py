import numpy as np
import matplotlib.pyplot as plt

from scipy.sparse import csr_matrix
from scipy.sparse.csgraph import minimum_spanning_tree

from sklearn.cluster import KMeans, AgglomerativeClustering
from sklearn.datasets import load_iris
from sklearn.decomposition import PCA

# ----------------------------------
# Load the Iris Dataset
# ----------------------------------

iris = load_iris()
data = iris.data

# ----------------------------------
# K-Means Clustering
# ----------------------------------

num_clusters = 3

kmeans = KMeans(
    n_clusters=num_clusters,
    random_state=42,
    n_init=10
)

kmeans.fit(data)

kmeans_labels = kmeans.labels_
kmeans_centroids = kmeans.cluster_centers_

# ----------------------------------
# Compute Pairwise Distance Matrix
# ----------------------------------

dist_matrix = np.linalg.norm(
    data[:, np.newaxis] - data,
    axis=-1
)

# ----------------------------------
# Create Minimum Spanning Tree (MST)
# ----------------------------------

mst = minimum_spanning_tree(csr_matrix(dist_matrix))

# Convert MST to connectivity matrix
connectivity_matrix = mst + mst.T

# ----------------------------------
# Agglomerative Clustering using MST
# ----------------------------------

agg_clustering = AgglomerativeClustering(
    n_clusters=num_clusters,
    connectivity=connectivity_matrix
)

mst_labels = agg_clustering.fit_predict(data)

# ----------------------------------
# Print Results
# ----------------------------------

print("K-Means Cluster Labels:")
print(kmeans_labels)

print("\nK-Means Cluster Centroids:")
print(kmeans_centroids)

print("\nMST-based Agglomerative Cluster Labels:")
print(mst_labels)

# ----------------------------------
# PCA for Visualization
# ----------------------------------

pca = PCA(n_components=2)

reduced_data = pca.fit_transform(data)

# ----------------------------------
# Plot Clusters
# ----------------------------------

plt.figure(figsize=(12, 5))

# K-Means Plot
plt.subplot(1, 2, 1)

plt.scatter(
    reduced_data[:, 0],
    reduced_data[:, 1],
    c=kmeans_labels,
    cmap="viridis"
)

plt.title("K-Means Clustering")
plt.xlabel("Principal Component 1")
plt.ylabel("Principal Component 2")

# MST Plot
plt.subplot(1, 2, 2)

plt.scatter(
    reduced_data[:, 0],
    reduced_data[:, 1],
    c=mst_labels,
    cmap="plasma"
)

plt.title("MST-based Agglomerative Clustering")
plt.xlabel("Principal Component 1")
plt.ylabel("Principal Component 2")

plt.tight_layout()
plt.show()