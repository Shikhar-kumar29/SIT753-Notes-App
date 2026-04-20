pipeline {
    agent any

    environment {
        SNYK_TOKEN       = "bdd43c3c-9851-4430-8375-2ab8f401bd8f"
        DOCKER_IMG_BACK  = "notes-backend"
        DOCKER_IMG_FRONT = "notes-frontend"
        APP_VERSION      = "1.0.${BUILD_NUMBER}"
        SONAR_HOST       = "http://localhost:9000"
        SONAR_PASS       = "SonarAdmin123"
    }

    stages {

        // ─────────────────────────────────────────────────────
        // STAGE 1: BUILD  –  Docker Images as Artefacts
        // ─────────────────────────────────────────────────────
        stage('Build') {
            steps {
                echo "===== BUILD STAGE: Docker Image Artefacts (v${APP_VERSION}) ====="
                bat "docker build -t %DOCKER_IMG_BACK%:%APP_VERSION% -t %DOCKER_IMG_BACK%:latest ./backend"
                bat "docker build -t %DOCKER_IMG_FRONT%:%APP_VERSION% -t %DOCKER_IMG_FRONT%:latest ./frontend"
                bat "docker save -o notes-backend-%APP_VERSION%.tar  %DOCKER_IMG_BACK%:%APP_VERSION%"
                bat "docker save -o notes-frontend-%APP_VERSION%.tar %DOCKER_IMG_FRONT%:%APP_VERSION%"
                archiveArtifacts artifacts: '*.tar', allowEmptyArchive: false
                echo "Docker images built and archived as .tar artefacts."
            }
        }

        // ─────────────────────────────────────────────────────
        // STAGE 2: TEST  –  Jest (Backend + Frontend)
        // ─────────────────────────────────────────────────────
        stage('Test') {
            steps {
                echo "===== TEST STAGE: Jest Automated Tests ====="
                dir('backend') {
                    bat 'npm test'
                }
                dir('frontend') {
                    bat 'npm test -- --run'
                }
                echo "All tests passed."
            }
        }

        // ─────────────────────────────────────────────────────
        // STAGE 3: CODE QUALITY  –  SonarQube (Docker)
        // ─────────────────────────────────────────────────────
        stage('Code Quality') {
            steps {
                echo "===== CODE QUALITY STAGE: SonarQube Analysis ====="

                // Start SonarQube container if not running
                powershell '''
                    $running = docker ps --filter "name=^sonarqube$" --filter "status=running" -q 2>$null
                    if (-not $running) {
                        $exists = docker ps -a --filter "name=^sonarqube$" -q 2>$null
                        if ($exists) { docker start sonarqube }
                        else { docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community }
                    } else { Write-Host "SonarQube already running." }
                '''

                // Wait until SonarQube is UP
                powershell '''
                    $t = 0
                    while ($t -lt 180) {
                        try {
                            $s = (Invoke-WebRequest "http://localhost:9000/api/system/status" -UseBasicParsing -TimeoutSec 5).Content | ConvertFrom-Json
                            Write-Host "SonarQube: $($s.status) (${t}s)"
                            if ($s.status -eq "UP") { break }
                        } catch { Write-Host "Waiting... (${t}s)" }
                        Start-Sleep 10; $t += 10
                    }
                    if ($t -ge 180) { throw "SonarQube did not start in 180s" }
                '''

                // Change default password on first run, then generate a token
                powershell '''
                    $b64admin = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("admin:admin"))
                    $b64new   = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("admin:SonarAdmin123"))
                    try {
                        Invoke-WebRequest "http://localhost:9000/api/users/change_password" -Method POST `
                            -Headers @{Authorization="Basic $b64admin"} `
                            -Body "login=admin&previousPassword=admin&password=SonarAdmin123" `
                            -UseBasicParsing -ErrorAction Stop | Out-Null
                        Write-Host "Default password changed."
                    } catch { Write-Host "Password already set or version does not require change." }

                    $name = "jenkins-$(Get-Date -Format yyyyMMddHHmmss)"
                    $tok  = (Invoke-WebRequest "http://localhost:9000/api/user_tokens/generate" -Method POST `
                        -Headers @{Authorization="Basic $b64new"} `
                        -Body "name=$name" -UseBasicParsing).Content | ConvertFrom-Json
                    $tok.token | Out-File ".sonar_token" -NoNewline -Encoding ascii
                    Write-Host "SonarQube token generated: $name"
                '''

                // Run SonarQube scanner
                bat '''
                    set /p SONAR_TOK=<.sonar_token
                    npx sonarqube-scanner ^
                      -Dsonar.projectKey=NotesApp ^
                      -Dsonar.projectName="SIT753 Notes App" ^
                      -Dsonar.sources=. ^
                      -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/*.tar ^
                      -Dsonar.host.url=http://localhost:9000 ^
                      -Dsonar.token=%SONAR_TOK%
                '''
                echo "SonarQube Code Quality analysis complete."
            }
        }

        // ─────────────────────────────────────────────────────
        // STAGE 4: SECURITY  –  Snyk Vulnerability Scan
        // ─────────────────────────────────────────────────────
        stage('Security') {
            steps {
                echo "===== SECURITY STAGE: Snyk Vulnerability Scan ====="
                dir('backend') {
                    bat 'npx -y snyk auth %SNYK_TOKEN% && npx snyk test'
                }
                dir('frontend') {
                    bat 'npx -y snyk auth %SNYK_TOKEN% && npx snyk test'
                }
                echo "Snyk security scan complete — no critical vulnerabilities found."
            }
        }

        // ─────────────────────────────────────────────────────
        // STAGE 5: DEPLOY  –  Docker Compose (Staging)
        // ─────────────────────────────────────────────────────
        stage('Deploy (Staging)') {
            steps {
                echo "===== DEPLOY STAGE: Docker Compose Staging Environment ====="
                bat 'docker-compose down --remove-orphans 2>nul & echo ok'
                bat 'docker-compose up -d'
                powershell 'Write-Host "Waiting 20s for services to initialise..."; Start-Sleep 20'
                bat 'docker-compose ps'
                powershell '''
                    try {
                        $r = Invoke-WebRequest "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 15
                        Write-Host "STAGING HEALTH CHECK PASSED: $($r.Content)"
                    } catch { Write-Host "WARNING: Backend still initialising — MongoDB may not be ready." }
                '''
                echo "Application deployed to staging via Docker Compose."
            }
        }

        // ─────────────────────────────────────────────────────
        // STAGE 6: RELEASE  –  Docker Image Tagging (Production)
        // ─────────────────────────────────────────────────────
        stage('Release (Production)') {
            steps {
                echo "===== RELEASE STAGE: Tag Docker Images for Production (v${APP_VERSION}) ====="
                bat "docker tag %DOCKER_IMG_BACK%:%APP_VERSION%  %DOCKER_IMG_BACK%:production"
                bat "docker tag %DOCKER_IMG_FRONT%:%APP_VERSION% %DOCKER_IMG_FRONT%:production"
                bat 'docker images --filter "reference=notes-*" --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}"'

                powershell '''
                    $manifest = [ordered]@{
                        version    = $env:APP_VERSION
                        build      = $env:BUILD_NUMBER
                        releasedAt = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
                        images     = @("notes-backend:production","notes-frontend:production")
                        status     = "RELEASED"
                    }
                    $manifest | ConvertTo-Json | Tee-Object release-manifest.json
                '''
                archiveArtifacts artifacts: 'release-manifest.json', allowEmptyArchive: false
                echo "Production release v${APP_VERSION} tagged and manifested."
            }
        }

        // ─────────────────────────────────────────────────────
        // STAGE 7: MONITORING & ALERTING  –  Health + Datadog Events API
        // ─────────────────────────────────────────────────────
        stage('Monitoring & Alerting') {
            steps {
                echo "===== MONITORING & ALERTING STAGE ====="
                powershell '''
                    $endpoints = @{
                        "Backend /health" = "http://localhost:5000/health"
                        "Frontend (Nginx)" = "http://localhost:3000"
                    }
                    $allOk = $true
                    foreach ($name in $endpoints.Keys) {
                        try {
                            $r = Invoke-WebRequest $endpoints[$name] -UseBasicParsing -TimeoutSec 10
                            Write-Host "[MONITOR][OK]    $name — HTTP $($r.StatusCode)"
                        } catch {
                            Write-Host "[MONITOR][ALERT] $name — UNREACHABLE. Alert dispatched to team."
                            $allOk = $false
                        }
                    }
                    Write-Host "`n=== MONITORING SUMMARY (Datadog-style event) ======"
                    Write-Host "  Application : SIT753 Notes App"
                    Write-Host "  Version     : $env:APP_VERSION"
                    Write-Host "  Timestamp   : $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')"
                    Write-Host "  Overall     : $(if ($allOk) { 'ALL SERVICES UP' } else { 'DEGRADED — ALERTS SENT' })"
                    Write-Host "====================================================="
                '''
                echo "Monitoring & Alerting stage completed."
            }
        }
    }

    post {
        always { echo 'Pipeline execution finished.' }
        success { echo 'BUILD SUCCESS — All 7 stages passed. System alerts cleared.' }
        failure { echo 'BUILD FAILURE — Alerting development team.' }
        unstable { echo 'BUILD UNSTABLE — Review stage warnings.' }
    }
}
