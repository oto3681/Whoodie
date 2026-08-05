Deploying the server to Google Cloud Run

Prerequisites
- A Google Cloud project with billing enabled.
- A GCP service account with permissions: Cloud Run Admin, Storage Admin (or Artifact Registry), Service Account User.
- Create a JSON key for that service account.
- Repository secrets in GitHub: `GCP_SA_KEY`, `GCP_PROJECT_ID`, `GCP_REGION`, and MPESA secrets (`MPESA_CONSUMER_KEY`, etc.).

What we added
- `Dockerfile` — multi-stage build for compiling and running the server.
- GitHub Actions workflow: `.github/workflows/deploy-cloud-run.yml` — builds the container, pushes to GCR, and deploys to Cloud Run.

How to configure
1. In GitHub repository Settings → Secrets, add:
   - `GCP_SA_KEY`: the JSON content of the service account key
   - `GCP_PROJECT_ID`: your GCP project id
   - `GCP_REGION`: region for Cloud Run (e.g., `us-central1`)
   - MPESA secrets: `MPESA_ENVIRONMENT`, `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`, `MPESA_SHORTCODE`
2. Push to `main` — the workflow will run automatically and deploy to Cloud Run service `whoodie-service`.

After deployment
- The workflow outputs `service_url` for the Cloud Run service. Copy the URL and set `APP_URL` in your frontend host (Vercel or AI Studio) to that URL so callbacks and API calls point to Cloud Run.

Notes
- Cloud Run will expose the application at the service URL; ensure your frontend uses HTTPS and the `APP_URL` env var is set in its deployment.
- If you prefer Artifact Registry instead of GCR, update the `docker/build-push-action` tags accordingly.
