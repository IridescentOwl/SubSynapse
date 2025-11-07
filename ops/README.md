# Operations Guide

This guide provides instructions for operational tasks related to the Subsynapse application, including SSL setup and monitoring.

## SSL Configuration with Let's Encrypt

To secure your application with an SSL certificate, we recommend using Let's Encrypt and Certbot. The following steps will guide you through the process of obtaining and installing a certificate.

### Prerequisites

- A registered domain name.
- A server with Docker and Docker Compose installed.
- Your DNS records pointing your domain to your server's IP address.

### Steps to Obtain and Install the Certificate

1.  **Update the Nginx Configuration:**
    - Open the `nginx.conf` file in the root of the project.
    - Add a new `server` block to handle HTTPS traffic on port 443.
    - You will also need to configure the paths to your SSL certificate and private key.

    ```nginx
    server {
      listen 443 ssl;
      server_name yourdomain.com;

      ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

      # Other SSL settings...
    }
    ```

2.  **Use Certbot to Obtain the Certificate:**
    - You can run Certbot in a Docker container to obtain the certificate.
    - This command will mount the Nginx configuration directory and the Let's Encrypt directory to the Certbot container.

    ```bash
    docker run -it --rm --name certbot \
      -v "/etc/letsencrypt:/etc/letsencrypt" \
      -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
      certbot/certbot certonly \
      --webroot -w /usr/share/nginx/html \
      -d yourdomain.com
    ```

3.  **Set Up Automatic Renewal:**
    - Let's Encrypt certificates are valid for 90 days. You should set up a cron job to automatically renew them.

    ```bash
    crontab -e
    ```

    - Add the following line to renew the certificate every day at midnight:

    ```
    0 0 * * * docker run --rm --name certbot -v "/etc/letsencrypt:/etc/letsencrypt" -v "/var/lib/letsencrypt:/var/lib/letsencrypt" certbot/certbot renew --quiet
    ```

This setup provides a secure and automated way to manage SSL for your application.

---

## Monitoring and Health Checks

This section provides information on how to monitor the health and performance of the application.

### Health Check Endpoint

The backend provides a health check endpoint at `/api/health`. You can use this endpoint to monitor the status of the application and its database connection.

A `200` status code indicates that the application is running and can connect to the database. A `500` status code indicates an issue with the database connection.

### Sentry for Performance Monitoring

This project is integrated with Sentry for error tracking and performance monitoring. To enable Sentry, you will need to add your Sentry DSN to the `backend/.env.production` file.

```
SENTRY_DSN=<your-sentry-dsn>
```

With Sentry enabled, you will be able to monitor the performance of your application, track errors, and receive alerts for any issues.

---

## Database Backup and Recovery

This section outlines the recommended strategy for backing up and recovering the application's database.

### Database Service

For a production environment, it is highly recommended to use a managed database service like MongoDB Atlas. These services provide automated backups, point-in-time recovery, and a host of other features that are essential for a production application.

### Backup Strategy with MongoDB Atlas

- **Enable Continuous Backups:** Ensure that continuous backups are enabled for your MongoDB Atlas cluster. This will allow you to restore your database to any point in time.
- **Configure Snapshot Retention:** Configure a snapshot retention policy that meets your business requirements. A common policy is to retain daily snapshots for 7 days, weekly snapshots for a month, and monthly snapshots for a year.
- **Enable Geographic Redundancy:** Store your backups in a different geographic region from your primary database. This will protect your data in the event of a regional outage.

### Recovery Procedure

In the event of a database failure, you can restore your database from a backup using the MongoDB Atlas UI.

1.  **Log in to your MongoDB Atlas account.**
2.  **Navigate to the "Backup" tab for your cluster.**
3.  **Choose a restore point:** You can either select a point in time or a snapshot to restore from.
4.  **Follow the on-screen instructions to restore the database.**

---

## Domain Configuration with a CDN

To improve the performance and security of your application, it is recommended to use a Content Delivery Network (CDN) like Cloudflare.

### Setting up Cloudflare

1.  **Create a Cloudflare account:** Sign up for a free account on the Cloudflare website.
2.  **Add your domain:** Add your domain to Cloudflare and follow the on-screen instructions to update your DNS records.
3.  **Configure SSL/TLS:** In the SSL/TLS settings, choose the "Full (Strict)" mode to ensure a secure connection between Cloudflare and your server.
4.  **Enable Caching and Minification:** In the "Speed" settings, enable caching for static assets and enable minification for HTML, CSS, and JavaScript.

By using a CDN, you can reduce the latency for your users, protect your application from DDoS attacks, and improve the overall performance of your application.
