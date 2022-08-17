## Threejs Journey Exercises

This repo holds the [Threejs Journey](https://threejs-journey.com/) Exercises by [Bruno Simon](https://bruno-simon.com/). Threejs Journey is a course tailored to teach beginners or advanced developers alike on how to develop 3D Websites (or games) using [Three.js](https://threejs.org/), a JavaScript 3D Library.

### Pre-requisites

- Basic understanding of [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- (Optional) [Git](https://git-scm.com/) version control system. This is used to fetch this repo to your computer and/or uploading it on your own repo on [Github](https://github.com) if you wanted to.
- [Nodejs](https://nodejs.org/) installed on your system [^1].
- [NPM](https://www.npmjs.com/) package manager (nodejs comes with npm installed by default)
- A code editor of your choice, [VSCode](https://code.visualstudio.com/) is heavily used throughout the course but you can still use something like [Sublime](https://www.sublimetext.com/)

### Getting Started

#### Get this repo on your local machine

Either [download](https://github.com/lnfel/threejs-lamy/archive/refs/heads/template.zip) this repo as a zip file and extract it to some folder on your system. Or clone this repo using git:

```sh
git clone https://github.com/lnfel/threejs-lamy.git
```

#### Project Template

If you downloaded the repo using the download link above, you are automatically using the template branch. You can skip this part and head to [the first exercise](#starting-with-the-first-exercise).

The [template](https://github.com/lnfel/threejs-lamy/tree/template) branch of this repo is the starting blank template. Use it when starting from scratch. By default, cloning a repo starts you with the deafult branch which is usually named `master` or `main` or whatever the author of the repo have set.

To start working with the template branch do the following with git using the terminal or command prompt:

1. Fetch remote branches from remote source
```sh
git fetch
```

2. You can see the branches available for checkout with:
```sh
git branch -v -a
```

3. Switch to template branch or create a new one using the template
  - Switch to template branch
    ```sh
    git checkout template
    # or
    git switch template
    ```
  - Create a new branch from template and switch to it
    ```sh
    git checkout -b your-custom-branch template
    # or
    git switch --create your-custom-branch template
    ```

4. To confirm you have switched to template branch or have switched to your newly create branch do:

```sh
git branch
```

This will list all branches and the one with `*` is the one your are currently on. Something like the following:

```sh
> git branch
  main
* template
```
or if you have created your own branch
```sh
> git branch
  main
  template
* your-custom-branch
```

This one command will only list the branch you are on:
```sh
git branch --show-current
```

#### Starting with the first exercise

The first episode of the course is about an introduction about Bruno and what will be taught throughout the course. The second episode he teaches about understanding what is [WebGL](https://get.webgl.org/).

Third episode is where we do actual hands-on exercises with Threejs.

#### Initializing the fourth project and onwards

Starting episode four, we will start using npm package manager to install dependencies required to run the exercise, this includes the [three](https://www.npmjs.com/package/three) (three.js) package.

Bruno teaches us how to initialize the project but for documentation I will include a step on how to do it.

Using the terminal or command prompt, go to the exercise folder.

```sh
cd path/to/project/04-webpack
```

Next is install the exercise dependencies using npm:

```sh
npm install
```

Finally run the development server using:

```sh
npm run dev
```

This will open up `http://192.168.0.101:8080/` or `localhost:8080` on your default browser. Everytime you make a change on the exercise and save it, the browser tab automatically refreshes the changes made.

### Footnotes

[^1]: From my experience Nodejs version 14.0.0 (npm version 6.14.4) and up should work on the exercises. When using version 18.7.0 of node (npm version 8.15..0), running `npm install` will automatically detect that package-lock.json file is created using old version of npm and modify the package-lock.json file to be compatible with recent versions on npm.