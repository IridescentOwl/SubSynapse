# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it to us by emailing `security@example.com`. We will respond to your report within 48 hours.

## Security Scanning with Snyk

We use Snyk to scan our codebase for vulnerabilities in our dependencies and our own code. To run a scan, you will need to:

1.  **Install the Snyk CLI:** Follow the instructions at [https://docs.snyk.io/snyk-cli/install-the-snyk-cli](https://docs.snyk.io/snyk-cli/install-the-snyk-cli) to install the Snyk CLI and authenticate your machine.

2.  **Scan for vulnerabilities:** Navigate to the `backend` directory and run the following commands:

    ```bash
    # Scan for vulnerabilities in your dependencies
    snyk test

    # Scan your code for vulnerabilities
    snyk code test
    ```

3.  **Review and fix vulnerabilities:** Snyk will provide a report of any vulnerabilities it finds, along with recommendations for how to fix them.

## Manual Code Review

In addition to automated scanning, we also perform manual code reviews of all code changes. We pay special attention to the following areas:

*   Authentication and authorization
*   Input validation
*   Data encryption
*   Error handling
*   Dependency management
