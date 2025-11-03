# Load Testing with k6

This directory contains a sample k6 script for load testing the Subsynapse API.

## Installation

First, you need to install k6. Follow the official installation instructions for your operating system:

[https://k6.io/docs/getting-started/installation/](https://k6.io/docs/getting-started/installation/)

## Running the Script

To run the load test, navigate to this directory in your terminal and run the following command:

```bash
k6 run k6-script.js
```

This will simulate a ramp-up of virtual users over a few minutes, hitting the `getGroups` endpoint.

## Customizing the Script

The provided script is a basic example. You can customize it to test other endpoints, simulate more complex user flows, and adjust the load parameters. For more information on writing k6 scripts, refer to the official documentation:

[https://k6.io/docs/getting-started/running-k6/](https://k6.io/docs/getting-started/running-k6/)
