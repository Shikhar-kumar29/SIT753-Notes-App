# Detailed Setup Guide: 7-Stage Jenkins DevOps Pipeline

This guide explains how to implement all 7 stages of your DevOps pipeline for the Notes App to achieve a High Distinction (HD) grade.

---

## 1. Local Prerequisites
Ensure the following are installed on your machine:
*   **Docker Desktop**: Required for the Build, Deploy, and Release stages.
*   **Jenkins**: Installed locally (usually `http://localhost:8080`).
*   **Node.js**: Installed for local verification.
*   **SonarQube (Optional)**: You can run it via Docker: `docker run -d --name sonarqube -p 9000:9000 sonarqube:lts`.

---

## 2. GitHub Setup
1.  **Create a Repository**: Go to GitHub and create a new repository called `SIT753-Notes-App`.
2.  **Upload Code**:
    ```bash
    git init
    git add .
    git commit -m "Initial commit of Notes App and Pipeline"
    git branch -M main
    git remote add origin YOUR_GITHUB_REPO_URL
    git push -u origin main
    ```

---

## 3. Jenkins Configuration (The "What to Click" Guide)

### A. Install Necessary Plugins
1.  Open Jenkins (`http://localhost:8080`).
2.  Go to **Manage Jenkins** > **Plugins** > **Available Plugins**.
3.  Search for and install:
    *   `Docker`
    *   `Docker Pipeline`
    *   `SonarQube Scanner`
    *   `Snyk Security`

### B. Add Security Credentials
1.  Go to **Manage Jenkins** > **Credentials** > **System** > **Global credentials**.
2.  Click **Add Credentials**:
    *   **Snyk Token**: Kind: `Secret text`, ID: `SNYK_TOKEN`, Secret: (Get from Snyk settings).
    *   **Sonar Token**: Kind: `Secret text`, ID: `SONAR_TOKEN`, Secret: (Get from SonarQube settings).

---

## 4. Creating the Pipeline Stage-by-Stage

1.  On Jenkins Home, click **New Item**.
2.  Enter name: `Notes-DevOps-Pipeline` and select **Pipeline**.
3.  Scroll down to **Pipeline** section.
4.  Definition: `Pipeline script from SCM`.
5.  SCM: `Git`.
6.  Repository URL: (Your GitHub Link).
7.  Branch: `*/main`.
8.  Script Path: `Jenkinsfile`.
9.  Click **Save**.

---

## 5. Explanation of the 7 Stages (For your Report)

| Stage | Tool Used | Description |
| :--- | :--- | :--- |
| **1. Build** | Docker | Creates immutable Docker images (artefacts) for Frontend and Backend. |
| **2. Test** | Jest, Vitest | Runs 100% automated backend API tests and frontend UI tests. |
| **3. Code Quality** | SonarQube | Analyzes code for "smells", duplication, and complexity to ensure maintainability. |
| **4. Security** | Snyk | Scans `package.json` for known vulnerabilities in third-party libraries. |
| **5. Deploy** | Docker Compose | Spins up the application in a **Staging** environment for final verification. |
| **6. Release** | Docker Tag | Tags the stable version as `prod` and promotes it to the production environment. |
| **7. Monitoring** | Health Check | Integrates a `/health` endpoint to monitor uptime and alert the team on failure. |

---

## 6. How to Run & Verify
1.  Click **Build Now** in your Jenkins project.
2.  Watch the **Pipeline Console Output**.
3.  **Gold Status**: Every stage should turn **Green**.
4.  **Verify App**: 
    *   Staging backend: `http://localhost:5000`
    *   Frontend: `http://localhost:3000`
    *   Health check: `http://localhost:5000/health`

---

## 7. Submission Checklist (Appendix II)
- [ ] Screenshot of all 7 Green stages in Jenkins.
- [ ] Link to your GitHub Repository.
- [ ] Demo video (show the code, the Jenkins run, and the working app).
- [ ] PDF Report using this guide for descriptions.
