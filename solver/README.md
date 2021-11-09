# NOT USING CHALICE ANYMORE

# PapsolvPi

Python backend for the Papa-Problem-Solver.
Leverages the chalice framework to deploy serverless lambda functions on AWS.

## Prerequisites

`Python 3.7.3` was used for development of this project. Other versions of python may work but are not tested by me.

Make sure to have your AWS credentials set up in the

```
~/.aws/credentials
```

file. Also, having the chalice and/or AWS CLI(s) installed globally probably is a good idea

## Project setup

### Virtualenv

Clone this repository and initialize your virtualenv in the `chalice-solver` directory (e.g. `chalice-solver/.venv`)

```
python3 -m venv .venv
```

and activate is using `source .venv/bin/activate`

### pip dependencies

Next, install the required dependencies

```
pip install -r requirements.txt
```

This should install all necessary dependencies, including `chalice` and Google `ortools`. Depending on your specific setup, the C dependencies of ortools may need to be dealt with.

### Compiles and hot-reloads for development

```
chalice local
```

### Deploy to production

To push the code to AWS:

```
chalice deploy
```

### Linting

For linting, `black` is used. You might want to configure your editor (VS Code in my case) accordingly.

## Testing

`pytest` testing not yet implemented.
