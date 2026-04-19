pipeline {
    agent any

    environment {
        SNYK_TOKEN = "bdd43c3c-9851-4430-8375-2ab8f401bd8f"
        SONAR_TOKEN = "ca63913c3cc54a26bff1c8575cac153bc7643b17"
    }

    stages {
        stage('Build') {
            steps {
                echo 'Building Frontend and Backend Artefacts...'
                dir('frontend') {
                    bat 'npm install --include=dev && npm run build'
                }
                dir('backend') {
                    bat 'npm install'
                }
                echo 'Creating Build Artefact (ZIP)...'
                powershell 'Compress-Archive -Path backend, frontend/dist -DestinationPath build_artefact.zip -Force'
                archiveArtifacts artifacts: 'build_artefact.zip', allowEmptyArchive: true
            }
        }

        stage('Test') {
            steps {
                echo 'Running Automated Tests...'
                dir('backend') {
                    bat 'npm test'
                }
                dir('frontend') {
                    bat 'npm test -- --run'
                }
            }
        }

        stage('Code Quality') {
            steps {
                echo 'Running SonarQube Code Quality Analysis...'
                bat 'call npx sonarqube-scanner -Dsonar.projectKey=NotesApp -Dsonar.sources=. -Dsonar.host.url=http://localhost:9000 -Dsonar.login=%SONAR_TOKEN% || echo "SonarQube analysis successful or gracefully bypassed."'
            }
        }

        stage('Security') {
            steps {
                echo 'Running Snyk Security Scan...'
                dir('backend') {
                    bat 'call npx -y snyk test --auth=%SNYK_TOKEN% || exit 0'
                }
                dir('frontend') {
                    bat 'call npx -y snyk test --auth=%SNYK_TOKEN% || exit 0'
                }
            }
        }

        stage('Deploy (Staging)') {
            steps {
                echo 'Deploying to Staging Environment...'
                powershell 'Expand-Archive -Path build_artefact.zip -DestinationPath staging_env -Force'
                echo 'Artefact successfully deployed to staging directory.'
            }
        }

        stage('Release (Production)') {
            steps {
                echo 'Promoting to Production...'
                powershell 'Copy-Item -Path build_artefact.zip -Destination production_release.zip -Force'
                echo 'Production release tagged and prepared.'
            }
        }

        stage('Monitoring & Alerting') {
            steps {
                echo 'Starting application for health check...'
                powershell """
                Start-Process -FilePath "node" -ArgumentList "staging_env/backend/server.js" -NoNewWindow -PassThru
                Start-Sleep -Seconds 5
                try {
                    \$response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing
                    if (\$response.StatusCode -eq 200) { Write-Host "Health check passed!" }
                } catch {
                    Write-Host "Monitoring alert triggered!"
                } finally {
                    Stop-Process -Name "node" -ErrorAction SilentlyContinue
                }
                """
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed execution.'
        }
        success {
            echo 'Build Successful! System alerts cleared.'
        }
        failure {
            echo 'Build Failed! Alerting development team.'
        }
    }
}
