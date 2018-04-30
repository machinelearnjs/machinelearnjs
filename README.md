# scikit-learn-js

scikit-learn-js is a Javascript, which is written in Typescript, port of 
famous Python Machine Learning library Scikit-learn. This Javascript library is
still growing and many APIs are scheduled to be ported over or integrated. 

# Installation

Requirements:

- Node version >= 7

```bash
# yan add --save scikit-learn-js
# npm install --save scikit-learn-js
```

# Development

We welcome new contributors of all level of experience. For example if you are:

- Looking forward to jump into Machine Learning but JS is your primary language
- Looking to be part of a growing community
- You want to learn Typescript
- You want to learn Machine Learning

#### Docker environment

```bash
$ cd ~/scikit-learn-js
$ docker build -t scikit:latest .
$ docker run -it -v $(pwd):/home/node/app/ -v  scikit:latest bash
```

