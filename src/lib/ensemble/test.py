import numpy as np

clfs = [
    { "p": -1, "threshold": 0.6455696225166321, "feature_index": 0, "alpha": 11.512925148010254 },
    { "p": -1, "threshold": 0.6455696225166321, "feature_index": 1, "alpha": 11.512925148010254 },
    { "p": -1, "threshold": 0.6455696225166321, "feature_index": 2, "alpha": 11.512925148010254 },
    { "p": -1, "threshold": 0.6455696225166321, "feature_index": 3, "alpha": 11.512925148010254 },
    { "p": -1, "threshold": 0.6455696225166321, "feature_index": 4, "alpha": 11.512925148010254 },
    { "p": -1, "threshold": 0.6455696225166321, "feature_index": 5, "alpha": 11.512925148010254 },
]

test_x = np.array([ [ 5.4, 3, 4.5, 1.5 ],
  [ 5.6, 2.7, 4.2, 1.3 ],
  [ 7.7, 3, 6.1, 2.3 ],
  [ 5, 3.6, 1.4, 0.2 ],
  [ 6.3, 3.4, 5.6, 2.4 ],
  [ 5.2, 3.5, 1.5, 0.2 ],
  [ 5.5, 2.6, 4.4, 1.2 ],
  [ 5.2, 2.7, 3.9, 1.4 ],
  [ 4.9, 2.5, 4.5, 1.7 ],
  [ 6.6, 3, 4.4, 1.4 ],
  [ 6.2, 2.9, 4.3, 1.3 ],
  [ 5.5, 4.2, 1.4, 0.2 ],
  [ 6.9, 3.1, 5.1, 2.3 ],
  [ 6.5, 3.2, 5.1, 2 ],
  [ 5.5, 3.5, 1.3, 0.2 ],
  [ 6.3, 2.8, 5.1, 1.5 ],
  [ 4.7, 3.2, 1.3, 0.2 ],
  [ 7.2, 3, 5.8, 1.6 ],
  [ 6.1, 2.8, 4, 1.3 ],
  [ 7.4, 2.8, 6.1, 1.9 ],
  [ 6.7, 3.1, 4.4, 1.4 ],
  [ 5.1, 2.5, 3, 1.1 ],
  [ 4.4, 2.9, 1.4, 0.2 ],
  [ 4.9, 3.1, 1.5, 0.1 ],
  [ 5.9, 3, 5.1, 1.8 ],
  [ 6.7, 3.1, 4.7, 1.5 ],
  [ 5.1, 3.5, 1.4, 0.3 ],
  [ 6.1, 2.9, 4.7, 1.4 ],
  [ 5.6, 3, 4.5, 1.5 ],
  [ 7, 3.2, 4.7, 1.4 ],
  [ 6, 3, 4.8, 1.8 ],
  [ 6.4, 2.9, 4.3, 1.3 ],
  [ 5.6, 2.9, 3.6, 1.3 ],
  [ 6.5, 3, 5.2, 2 ],
  [ 6.1, 2.8, 4.7, 1.2 ],
  [ 6.3, 3.3, 6, 2.5 ],
  [ 4.9, 3.1, 1.5, 0.1 ],
  [ 5.7, 3.8, 1.7, 0.3 ] ])

def predict(X):
    n_samples = np.shape(X)[0]
    y_pred = np.zeros((n_samples, 1))
    # For each classifier => label the samples
    for clf in clfs:
        # Set all predictions to '1' initially
        predictions = np.ones(np.shape(y_pred))
        # The indexes where the sample values are below threshold
        negative_idx = (clf['p'] * X[:, clf['feature_index']] < clf['p'] * clf['threshold'])
        # Label those as '-1'
        predictions[negative_idx] = -1
        # Add predictions weighted by the classifiers alpha
        # (alpha indicative of classifier's proficiency)
        y_pred += clf['alpha'] * predictions

    # Return sign of prediction sum
    y_pred = np.sign(y_pred).flatten()

    return y_pred

# predictions = predict(test_x)

# print(predictions)

print(test_x[:, 4])
