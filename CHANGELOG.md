# Change Log

All notable changes to this project will be documented in this file.

## [1.2.3]

:rocket: bug fixes :rocket:

- **docs:** all-contributors module for contribution recognisation
- **devops:** Husky precommit hooks to ensure all commits satisfy the linters. Thanks @OlegStotsky !!
- **docs:** Removed the codacy badge and its integration
- **devops:** Development environment now supports Windows environment. Thanks @LSBOSS !
- **bug:** PolynomialFeatures and normalize exports in preprocessing/index.ts
- **bug:** SGDClassifier and SGDRegressor exports in linear_model/index.ts

## [1.2.2]

:rocket: Adding Examples page, more linear models and more datasets :rocket:

- **docs:** Examples page on the doc site - Titanic Datasets using RandomForest
- **docs:** Hiding utils functions from showing up in the doc
- **feature:** Adding PolynomialFeature extraction
- **docs:** KMeans clustering demo
- **bug:** Incorrect import statement on KMeans clustering example

## [1.2.1]

:bug: Fixing the documentation bug :bug:

- **docs:** Updating the SGD documentations

## [1.2.0]

:rocket: Introducing new features! :rocket:

_Updates:_

- **feature:** preprocessing/add_dummy_feature
- **feature:** linear_model/SGDClassifier
- **feature:** linear_model/SGDRegressor

## [1.1.1]

_Updates:_

- **enhance:** ensemble/RandomForest
- **docs:** Better rendering for object and promise type return values
- **enhance:** Datasets APIs are now based on promise

## [1.1.0]

:raised_hands: Minor release to deliver a couple improvements :raised_hands:

In this minor release, it focuses on the first enhancement of existing APIs and delivers new features. As the release contains a feature, GaussianNB, and an enhancement of DecisionTree, we thought a minor release is suitable for it.

_Updates:_

- **feature:** GaussianNB (Gaussian Naive Bayes Classifier)
  -- What is Naive Bayes? Please check out https://machinelearningmastery.com/naive-bayes-for-machine-learning/
- **enhancement:** DecisionTree
  -- Fixed the way that the DecisionTree returns the prediction results
  -- Instead of returning all the possible Leafs, it will return the most occurred target Leaf according to a voting process

## [1.0.0]

:baby_chick: hooray! initial release :baby_chick:

In the first release of Kalimdorjs,
it aims to deliver the essential models and algorithms required to conduct
the fundamental Machine Learning experiment and development. Some APIs still
might be unstable but they will be improved over time as we receive feedback
from people. You will be seeing new patches being delivered constantly to make gradual
improvements until the library reaches a certain level of maturity.

- **feature:** cluster/KMeans
- **feature:** datasets/Iris
- **feature:** decomposition/PCA
- **feature:** ensemble/RandomForest
- **feature:** feature_extraction/CountVectorizer
- **feature:** linear_model/LinearRegression
- **feature:** metrics/accuracyScore
- **feature:** metrics/confusion_matrix
- **feature:** metrics/zeroOneLoss
- **feature:** model_selection/KFold
- **feature:** model_selection/train_test_split
- **feature:** neighbors/KDTree
- **feature:** neighbors/KNeighborClassifier
- **feature:** preprocessing/Binarizer
- **feature:** preprocessing/Imputer
- **feature:** preprocessing/LabelEncoder
- **feature:** preprocessing/MinMaxScaler
- **feature:** preprocessing/OneHotEncoder
- **feature:** svm/NuSVC
- **feature:** svm/NuSVR
- **feature:** svm/OneClassSVM
- **feature:** svm/SVC
- **feature:** svm/SVR
- **feature:** tree/DecisionTreeClassifier
