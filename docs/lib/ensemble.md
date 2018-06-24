[kalimdor](../README.md) > [ensemble/RandomForestClassifier](../classes/_lib_ensemble_forest_.randomforestclassifier.md)

# Class: RandomForestClassifier

## Hierarchy

**RandomForestClassifier**

## Index

### Constructors

* [constructor](_lib_ensemble_forest_.randomforestclassifier.md#constructor)

### Methods

* [fit](_lib_ensemble_forest_.randomforestclassifier.md#fit)
* [predict](_lib_ensemble_forest_.randomforestclassifier.md#predict)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new RandomForestClassifier**(props?: *`object`*): [RandomForestClassifier](_lib_ensemble_forest_.randomforestclassifier.md)

*Defined in [lib/ensemble/forest.ts:6](https://github.com/JasonShin/kalimdorjs/blob/12bcdb8/src/lib/ensemble/forest.ts#L6)*

RandomForestClassifier hey bro

**Parameters:**

| Param | Type | Default value |
| ------ | ------ | ------ |
| `Default value` props | `object` |  { nEstimator: 10 } |

**Returns:** [RandomForestClassifier](_lib_ensemble_forest_.randomforestclassifier.md)

___

## Methods

<a id="fit"></a>

###  fit

▸ **fit**(__namedParameters: *`object`*): `void`

*Defined in [lib/ensemble/forest.ts:21](https://github.com/JasonShin/kalimdorjs/blob/12bcdb8/src/lib/ensemble/forest.ts#L21)*

Build a forest of trees from the training set (X, y).

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `void`
void

___
<a id="predict"></a>

###  predict

▸ **predict**(X: *`any`*): `any`[]

*Defined in [lib/ensemble/forest.ts:44](https://github.com/JasonShin/kalimdorjs/blob/12bcdb8/src/lib/ensemble/forest.ts#L44)*

Predict class for X.

The predicted class of an input sample is a vote by the trees in the forest, weighted by their probability estimates. That is, the predicted class is the one with highest mean probability estimate across the trees.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| X | `any` |  array-like or sparse matrix of shape = \[n_samples\] |

**Returns:** `any`[]

___

