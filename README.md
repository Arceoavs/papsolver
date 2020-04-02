# PapSolver

[![Netlify Status](https://api.netlify.com/api/v1/badges/a3ff36a5-a693-4b3d-886d-4c95be6e69cb/deploy-status)](https://app.netlify.com/sites/papsolver/deploys)

The Papa-Problem-Solver: http://www.straussenburg.de

## About

Linear integer programming solver, to find an arbitrary combination of prices to match a set goal exactly. Used to bring my dads iTunes credit to 0.00€ (in order to make it possible to change countries).

## Project structure

The project is divided up into a client (papsolvue) and server (chalice-solver) directory.
The client is built upon the Vue.js framework while the backend leverages AWS lambda functions using the (Flask-like) Chalice python framework.

For more details concerning the code, please have a look into the respective README files in the client/ server directories.

## Contributing

This was an programming exercise I created for myself to get going with serverless concepts and AWS. Feel free to clone and modify the project. For bug fixes and additional features you might create a pull request.
