/* tslint:disable */

describe('integration:require', () => {
  it('should require all', () => {
    const kalimdor = require('kalimdor');
    expect(!!kalimdor).toBe(true);
  });
  it('should require cluster', () => {
    const { KMeans } = require('kalimdor/cluster');
    expect(!!KMeans).toBe(true);
  });

  it('should require datasets', () => {
    const { Iris } = require('kalimdor/datasets');
    expect(!!Iris).toBe(true);
  });

  it('should require decomposition', () => {
    const { PCA } = require('kalimdor/decomposition');
    expect(!!PCA).toBe(true);
  });

  it('should require ensemble', () => {
    const { RandomForestClassifier } = require('kalimdor/ensemble');
    expect(!!RandomForestClassifier).toBe(true);
  });

  it('should require feature_extraction', () => {
    const { CountVectorizer } = require('kalimdor/feature_extraction');
    expect(!!CountVectorizer).toBe(true);
  });

  it('should require linear_model', () => {
    const {
      LinearRegression,
      SGDClassifier,
      SGDRegressor
    } = require('kalimdor/linear_model');
    expect(!!LinearRegression).toBe(true);
    expect(!!SGDRegressor).toBe(true);
    expect(!!SGDClassifier).toBe(true);
  });

  it('should require metrics', () => {
    const {
      accuracyScore,
      confusion_matrix,
      zeroOneLoss
    } = require('kalimdor/metrics');
    expect(!!accuracyScore).toBe(true);
    expect(!!confusion_matrix).toBe(true);
    expect(!!zeroOneLoss).toBe(true);
  });

  it('should require model_selection', () => {
    const { KFold, train_test_split } = require('kalimdor/model_selection');
    expect(!!KFold).toBe(true);
    expect(!!train_test_split).toBe(true);
  });

  it('should require model_selection', () => {
    const { KNeighborsClassifier } = require('kalimdor/neighbors');
    expect(!!KNeighborsClassifier).toBe(true);
  });

  it('should require preprocessing', () => {
    const {
      add_dummy_feature,
      Binarizer,
      MinMaxScaler,
      normalize,
      OneHotEncoder,
      PolynomialFeatures,
      Imputer
    } = require('kalimdor/preprocessing');
    expect(!!Binarizer).toBe(true);
    expect(!!MinMaxScaler).toBe(true);
    expect(!!normalize).toBe(true);
    expect(!!OneHotEncoder).toBe(true);
    expect(!!PolynomialFeatures).toBe(true);
    expect(!!Imputer).toBe(true);
    expect(!!add_dummy_feature).toBe(true);
  });

  it('should require svm', () => {
    const {
      BaseSVM,
      NuSVC,
      NuSVR,
      OneClassSVM,
      SVC,
      SVR
    } = require('kalimdor/svm');
    expect(!!BaseSVM).toBe(true);
    expect(!!NuSVC).toBe(true);
    expect(!!NuSVR).toBe(true);
    expect(!!OneClassSVM).toBe(true);
    expect(!!SVC).toBe(true);
    expect(!!SVR).toBe(true);
  });

  it('should require tree', () => {
    const { DecisionTreeClassifier } = require('kalimdor/tree');
    expect(!!DecisionTreeClassifier).toBe(true);
  });

  it('should require naive_bayes', () => {
    const { GaussianNB } = require('kalimdor/naive_bayes');
    expect(!!GaussianNB).toBe(true);
  });
});
