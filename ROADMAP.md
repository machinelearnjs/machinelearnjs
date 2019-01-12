# Roadmap

An overview of what the machinelearn.js developers is looking to work on over the next few months.

As a caveat - this is a living doc, and will evolve as priorities grow and shift.
The machinelearn.js project will always be adapting to new use-cases and evolutions
in the platform - this roadmap is more of a "North Star" of what we're looking to work on than a strict timeline.

Please feel free to file issues on this repository if you have questions, concerns, or suggestions.

Last Updated: 30 / 10 / 2018 by Jason Shin

# machinelearn.js 3.0

Version 3 of machinelearn.js aims to extend the library by introducing more useful APIs based on tfjs as backend.
Unlike version 2, APIs will be gradually released under version 2 because each feature will be self-contained and 
will not bring in any breaking changes.

Ideas:

- crf stuff: https://sklearn-crfsuite.readthedocs.io/en/latest/
- various ensemble models from mlxtend: http://rasbt.github.io/mlxtend/
- gridsearch, randomizedsearch, bayesianoptimizedsearch from https://scikit-optimize.github.io/
- guassian process

# machinelearn.js 2.0

The new version of machinelearn.js will aim to bring in a various new Machine Learning models and algorithms along
with a major refactoring based on Tensorflow.js, which will naturally eliminate Math.js.

These changes will enable the models in machinelearn.js to take advantage of GPU acceleration, which is
provided by TF.js for free. As a result, it will provide a solid foundation for future enhancements.

The version 2.0 will bring in a few interesting Machine Learning algorithms including Genetic Algorithm. Here
is a full list of major updates and new APIs that will be in 2.0:

- Tensorflow.js integration
- GPU acceleration
- Genetic Algorithms
- Better typing system using Typescript
- Multinomial Bayesian Classifier
- Gradient Boosting algorithms
- Regression Metrics
- More blog articles on different use-cases of machinelearn.js
- Replacing the primary CI to Appveyor from TravisCI
- Consistent and simpler APIs; no more `.fit({X: ..., y: ...})`

#### Releases

We will use pre-release approach to make `v2` usable as soon as possible. In the meantime, `v1` will
still be considered the `latest` and `stable` while `v2` will remain `beta`.

Stabilised version of `v2` will be out as soon as it is clear that most of the codebase is rewritten
into Tensorflow.js.
