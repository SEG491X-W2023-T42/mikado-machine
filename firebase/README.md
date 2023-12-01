This is the infrastructure-as-code for Firestore.

# Setup

```bash
npm ci
npx firebase logout
npx firebase login
# Manually do https://cloud.google.com/sdk/docs/install
gcloud init
gcloud auth application-default login
```

# Running

`src/firebase.js` will detect if the browser is open to `localhost:PORT`. It will then tell the whole app to attempt to connect to the emulators running on the local machine. If this behavior is not desired, then connect to `127.0.0.1:PORT` instead. To start the emulators, run the following:

```bash
npm run start
```

# Deploying

Only do this after merging a pull request:

```bash
npm run deployProd
npm run deployFeatureFlagsProd
```

This will deploy indexes, and the rules. If more items have been added to this folder, then they might also be deployed.

# Updating the Snapshot

Run the following with the emulators running. Make sure all accounts are deleted so that passwords are not accidentally leaked.

```bash
rm -rf data
npm run deployFeatureFlags
npx firebase emulators:export ./data
```

# Further Reading

- <https://firebase.google.com/docs/cli>
- <https://firebase.google.com/docs/cli/targets>
