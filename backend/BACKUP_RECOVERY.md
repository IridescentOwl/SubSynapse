# Backup and Disaster Recovery

This document outlines the backup and disaster recovery procedures for the Subsynapse application.

## Database Backups

The Subsynapse application uses a MongoDB Atlas cluster for its database. MongoDB Atlas provides continuous, real-time backups of the database, which allows for point-in-time recovery.

### Backup Strategy

*   **Continuous Backups:** MongoDB Atlas's continuous backup feature is enabled for the cluster. This means that all changes to the database are backed up in real-time.
*   **Snapshots:** In addition to continuous backups, daily snapshots of the database are taken and retained for 7 days.
*   **Geographic Redundancy:** Backups are stored in a separate geographic region from the primary database cluster to protect against regional outages.

### Recovery Procedure

In the event of a database failure, you can restore the database from a backup using the MongoDB Atlas UI. You can choose to restore from a specific point in time or from a snapshot.

1.  **Log in to your MongoDB Atlas account.**
2.  **Navigate to the "Backup" tab for your cluster.**
3.  **Choose a restore point:** You can either select a point in time or a snapshot to restore from.
4.  **Follow the on-screen instructions to restore the database.**

## Application Recovery

In the event of an application failure, you can redeploy the application to a new server.

### Recovery Procedure

1.  **Provision a new server:** You will need to provision a new server with the same specifications as the original server.
2.  **Install the application dependencies:** You will need to install Node.js, npm, and any other dependencies required by the application.
3.  **Clone the application code:** Clone the application code from the Git repository.
4.  **Install the application dependencies:** Run `npm install` in the `backend` directory to install the application dependencies.
5.  **Configure the environment variables:** Create a `.env` file in the `backend` directory with the necessary environment variables, including the `DATABASE_URL` for the restored database.
6.  **Start the application:** Run `npm run dev` in the `backend` directory to start the application.
