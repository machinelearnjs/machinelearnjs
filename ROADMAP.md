# Roadmap

An overview of what the Kalimdor developers is looking to work on over the next few months.

As a caveat - this is a living doc, and will evolve as priorities grow and shift.
The Kalimdor project will always be adapting to new use-cases and evolutions
in the platform - this roadmap is more of a "North Star" of what we're looking to work on than a strict timeline.

Please feel free to file issues on this repository if you have questions, concerns, or suggestions.

Last Updated: 30 / 10 / 2018 by Jason Shin

# Kalimdor.js 2.0

The new version of Kalimdor will aim to bring in a various new Machine Learning models and algorithms along
with a major refactoring based on Tensorflow.js, which will naturally eliminate Math.js.

These changes will enable the models in Kalimdor.js to take advantage of GPU acceleration, which is
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
