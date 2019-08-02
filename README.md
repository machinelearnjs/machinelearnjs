# machinelearn.js

machinelearn.js is a Machine Learning library written in Typescript. It solves Machine Learning problems
and teaches users how Machine Learning algorithms work.

[![Build Status](https://dev.azure.com/jasonShin91/machinelearn.js/_apis/build/status/machinelearnjs.machinelearnjs?branchName=master)](https://dev.azure.com/jasonShin91/machinelearn.js/_build/latest?definitionId=1&branchName=master)
[![Build status](https://ci.appveyor.com/api/projects/status/juf77mt9fujcd2a2/branch/master?svg=true)](https://ci.appveyor.com/project/JasonShin/machinelearnjs/branch/master)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FJasonShin%2Fkalimdorjs.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FJasonShin%2Fkalimdorjs?ref=badge_shield)
[![Slack](https://slack.bri.im/badge.svg)](https://slack.bri.im)
[![ZenHub](https://i.imgur.com/nMF1yqZ.png)](https://app.zenhub.com/workspaces/machinelearnjs-5bef95354b5806bc2bf57ff3/boards?repos=131453423)

<img src="https://i.imgur.com/I5VbqB1.jpg">

# User Installation

Using yarn

```bash
$ yarn add machinelearn
```

Using NPM

```bash
$ npm install --save machinelearn
```

On the browsers

We use [jsdeliver](https://www.jsdelivr.com/package/npm/machinelearn) to distribute browser version of machinelearn.js

```html
<script src="https://cdn.jsdelivr.net/npm/machinelearn/machinelearn.min.js"></script>
<script>
    const { RandomForestClassifier } = ml.ensemble;
    const cls = new RandomForestClassifier();
</script>
```

Please see [https://www.jsdelivr.com/package/npm/machinelearn](https://www.jsdelivr.com/package/npm/machinelearn) for more details.

# Accelerations

By default, machinelearning.js will use pure Javascript version of tfjs. To enable acceleration
through C++ binding or GPU, you must import `machinelearn-node` for C++ or `machinelearn-gpu` for GPU.

1. C++

* installation

```bash
yarn add machinelearn-node
```

* activation

```javascript
import 'machinelearn-node';
```

2. GPU

* installation

```bash
yarn add machinelearn-gpu
```

* activation

```javascript
import 'machinelearn-gpu';
```

# Highlights

* Machine Learning on the browser and Node.js
* Learning APIs for users
* Low entry barrier

# Development

We welcome new contributors of all level of experience. The development guide will be added
to assist new contributors to easily join the project.

* You want to participate in a Machine Learning project, which will boost your Machine Learning skills and knowledge
* Looking to be part of a growing community
* You want to learn Machine Learning
* You like Typescript :heart: Machine Learning

# Simplicity

machinelearn.js provides a simple and consistent set of APIs to interact with the models and algorithms.
For example, all models have follow APIs:

* `fit` for training
* `predict` for inferencing
* `toJSON` for saving the model's state
* `fromJSON` for loading the model from the checkpoint

# Testing

Testing ensures you that you are currently using the most stable version of machinelearn.js

```bash
$ npm run test
```

# Supporting

Simply give us a :star2: by clicking on <img width="45" src="https://i.imgur.com/JEOaKBk.png">

# Contributing

We simply follow "fork-and-pull" workflow of Github. Please read CONTRIBUTING.md for more detail.

# Further notice

Great references that helped building this project!

* https://machinelearningmastery.com/
* https://github.com/mljs/ml
* http://scikit-learn.org/stable/documentation.html

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<!-- prettier-ignore -->
| [<img src="https://avatars0.githubusercontent.com/u/2525002?v=4" width="100px;"/><br /><sub><b>Jason Shin</b></sub>](https://github.com/JasonShin)<br />[📝](#blog-JasonShin "Blogposts") [🐛](https://github.com/machinelearnjs/machinelearnjs/issues?q=author%3AJasonShin "Bug reports") [💻](https://github.com/machinelearnjs/machinelearnjs/commits?author=JasonShin "Code") [📖](https://github.com/machinelearnjs/machinelearnjs/commits?author=JasonShin "Documentation") [⚠️](https://github.com/machinelearnjs/machinelearnjs/commits?author=JasonShin "Tests") | [<img src="https://avatars0.githubusercontent.com/u/21098186?v=4" width="100px;"/><br /><sub><b>Jaivarsan</b></sub>](https://github.com/greed2411)<br />[💬](#question-greed2411 "Answering Questions") [🤔](#ideas-greed2411 "Ideas, Planning, & Feedback") [📢](#talk-greed2411 "Talks") | [<img src="https://avatars2.githubusercontent.com/u/9072266?v=4" width="100px;"/><br /><sub><b>Oleg Stotsky</b></sub>](https://github.com/OlegStotsky)<br />[🐛](https://github.com/machinelearnjs/machinelearnjs/issues?q=author%3AOlegStotsky "Bug reports") [💻](https://github.com/machinelearnjs/machinelearnjs/commits?author=OlegStotsky "Code") [📖](https://github.com/machinelearnjs/machinelearnjs/commits?author=OlegStotsky "Documentation") [⚠️](https://github.com/machinelearnjs/machinelearnjs/commits?author=OlegStotsky "Tests") | [<img src="https://avatars3.githubusercontent.com/u/687794?v=4" width="100px;"/><br /><sub><b>Ben</b></sub>](https://github.com/benjaminmcdonald)<br />[💬](#question-benjaminmcdonald "Answering Questions") [🎨](#design-benjaminmcdonald "Design") [📢](#talk-benjaminmcdonald "Talks") [🐛](https://github.com/machinelearnjs/machinelearnjs/issues?q=author%3Abenjaminmcdonald "Bug reports") [💻](https://github.com/machinelearnjs/machinelearnjs/commits?author=benjaminmcdonald "Code") | [<img src="https://avatars1.githubusercontent.com/u/7292257?v=4" width="100px;"/><br /><sub><b>Christoph Reinbothe</b></sub>](https://github.com/LSBOSS)<br />[💻](https://github.com/machinelearnjs/machinelearnjs/commits?author=LSBOSS "Code") [🤔](#ideas-LSBOSS "Ideas, Planning, & Feedback") [🚇](#infra-LSBOSS "Infrastructure (Hosting, Build-Tools, etc)") [👀](#review-LSBOSS "Reviewed Pull Requests") | [<img src="https://avatars1.githubusercontent.com/u/14098106?v=4" width="100px;"/><br /><sub><b>Adam King</b></sub>](https://github.com/adamjking3)<br />[💻](https://github.com/machinelearnjs/machinelearnjs/commits?author=adamjking3 "Code") [⚠️](https://github.com/machinelearnjs/machinelearnjs/commits?author=adamjking3 "Tests") [📖](https://github.com/machinelearnjs/machinelearnjs/commits?author=adamjking3 "Documentation") |
| :---: | :---: | :---: | :---: | :---: | :---: |

<!-- ALL-CONTRIBUTORS-LIST:END -->
