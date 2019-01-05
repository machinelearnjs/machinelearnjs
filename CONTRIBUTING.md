# Contributing to machinelearn.js

All sort of contributions are welcome and there are no complicated rules with it.
We appreciate:

- New features
- Bug fixes
- Suggestions
- Ideas

## Issues

Feel free to submit issues, ideas, suggestions and enhancement requests.

## Contributing

Please refer to each project's style guidelines and guidelines for submitting patches and additions.
In general, we follow the "fork-and-pull" Git workflow.

1.  **Fork** the repo on GitHub
2.  **Clone** the project to your own machine
3.  **Commit** changes to your own branch
4.  **Push** your work back up to your fork
5.  Submit a **Pull request** so that we can review your changes

NOTE: Be sure to merge the latest from "upstream" before making a pull request!

## Development Environments

| type   | version                |
| ------ | ---------------------- |
| nodejs | Greater than 8.11.0    |
| OS     | Linux, Windows and Mac |

## Releasing

Releases will be done using scripts allocated under `scripts/relesases`. To create a new release, you will need
[docker](https://docs.docker.com/install/) available on your computer.

#### Making a release

1. Updating the changelog

Changelog is designed to record all the major changes that are happening in the current
patch/minor/major release. You must manually update the changelog before running the release script.

2. Merge `develop` to `master`

3. Run the release-it.sh script

```bash
# For patch
$ ./scripts/releases/release-it.sh -v patch

# For minor
$ ./scripts/releases/release-it.sh -v minor

# For major
$ ./scripts/releases/release-it.sh -v major
```

Running the script will result in following:

- Incrementing the project version according to the specified `-v`
- Creating a release commit to the `master` branch
- Creating a Github Release
- Publishing to NPM with a new version

4. Update the changelog on the Github release, which can be found at [https://github.com/machinelearnjs/machinelearnjs/releases](https://github.com/machinelearnjs/machinelearnjs/releases)

#### Disaster recovery

1. Reversing an accidental release

- Goto https://github.com/machinelearnjs/machinelearnjs/releases and delete mistakenly created release
- Unpublish the NPM module by running `npm unpublish machinelearn@<version>`

## Copyright and Licensing

machinelearn.js is an open source project licensed under the MIT license.

machinelearn.js does not require you to assign the copyright of your contributions, you retain the copyright.
machinelearn.js does require that you make your contributions available under the MIT license in order to be
included in the main repo.

If appropriate, include the MIT license summary at the top of each file along with the copyright info.
If you are adding a new file that you wrote, include your name in the copyright notice in the license
summary at the top of the file.

## License Summary

You can copy and paste the MIT license summary from below.

```
MIT License

Copyright (c) 2018 Jason Shin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```
