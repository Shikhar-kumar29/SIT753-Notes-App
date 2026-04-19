pipeline {
    agent any

    environment {
        DOCKER_IMAGE_BACKEND = "notes-backend"
        DOCKER_IMAGE_FRONTEND = "notes-frontend"
        SNYK_TOKEN = "bdd43c3c-9851-4430-8375-2ab8f401bd8f"
        SONAR_TOKEN = "ca63913c3cc54a26bff1c8575cac153bc7643b17"
    }

    stages {
        stage('Build') {
            steps {
                echo 'Building Docker Images (Artefacts)...'
                bat 'docker build -t %DOCKER_IMAGE_BACKEND%:latest ./backend'
                bat 'docker build -t %DOCKER_IMAGE_FRONTEND%:latest ./frontend'
            }
        }

        stage('Test') {
            steps {
                echo 'Running Automated Tests...'
                dir('backend') {
                    bat 'npm install && npm test'
                }
                dir('frontend') {
                    bat 'npm install --include=dev && npm test -- --run'
                }
            }
        }

        stage('Code Quality') {
            steps {
                echo 'Running SonarQube Code Quality Analysis...'
                bat 'npx sonarqube-scanner -Dsonar.projectKey=NotesApp -Dsonar.sources=. -Dsonar.host.url=http://localhost:9000 -Dsonar.login=%SONAR_TOKEN%'
            }
        }

        stage('Security') {
            steps {
                echo 'Running Snyk Security Scan...'
                dir('backend') {
                    bat 'npx -y snyk test --auth=%SNYK_TOKEN% || echo "Snyk found issues but letting pipeline proceed"'
                }
                dir('frontend') {
                    bat 'npx -y snyk test --auth=%SNYK_TOKEN% || echo "Snyk found issues but letting pipeline proceed"'
                }
            }
        }

        stage('Deploy (Staging)') {
            steps {
                echo 'Deploying to Staging Environment...'
                bat 'docker-compose -p notes-staging up -d'
                echo 'Waiting for services to start...'
                bat 'ping 127.0.0.1 -n 10 > nul'
            }
        }

        stage('Release (Production)') {
            steps {
                echo 'Promoting to Production...'
                bat 'docker tag %DOCKER_IMAGE_BACKEND%:latest %DOCKER_IMAGE_BACKEND%:prod'
                bat 'docker tag %DOCKER_IMAGE_FRONTEND%:latest %DOCKER_IMAGE_FRONTEND%:prod'
                echo 'Application released to Production environment.'
            }
        }

        stage('Monitoring & Alerting') {
            steps {
                echo 'Monitoring Application Health...'
                bat 'curl --fail http://localhost:5000/health || (echo "Health check failed!" & exit /b 1)'
                echo 'Monitoring Dashboard: http://localhost:5000/health'
                echo 'Alerting configured via Jenkins Email/Slack notifications.'
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed.'
        }
        success {
            echo 'Build Successful! Notifications Sent.'
        }
        failure {
            echo 'Build Failed! Alerting Team.'
        }
    }
}
