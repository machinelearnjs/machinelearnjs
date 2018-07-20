# Calculate the mean value of a list of numbers
def mean(values):
  return sum(values) / float(len(values))


# Calculate covariance between x and y
def covariance(x, mean_x, y, mean_y):
  covar = 0.0
  for i in range(len(x)):
    covar += (x[i] - mean_x) * (y[i] - mean_y)
  return covar


# Calculate the variance of a list of numbers
def variance(values, mean):
  return sum([(x - mean) ** 2 for x in values])


# Calculate coefficients
def coefficients(X, y):
  x_mean, y_mean = mean(X), mean(y)
  print(x_mean)
  print(y_mean)
  print('checking variacne', variance(X, x_mean))
  b1 = covariance(X, x_mean, y, y_mean) / variance(X, x_mean)
  print('b1', b1)
  b0 = y_mean - b1 * x_mean
  print(b0)
  return [b0, b1]


# calculate coefficients
dataset = [[1, 1], [2, 3], [4, 3], [3, 2], [5, 5]]
X = [1, 2, 4, 3, 5]
y = [1, 3, 3, 2, 5]
b0, b1 = coefficients(X, y)
print('Coefficients: B0=%.3f, B1=%.3f' % (b0, b1))