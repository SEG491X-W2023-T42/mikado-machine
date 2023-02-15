This is the infrastructure-as-code for Firestore.

# Setup

```bash
npm i -g firebase-tools
firebase login
```

# Running

`src/firebase.js` will detect if the browser is open to `localhost:PORT`. It will then tell the whole app to attempt to connect to the emulators running on the local machine. If this behavior is not desired, then connect to `127.0.0.1:PORT` instead. To start the emulators, run the following:

```bash
firebase emulators:start --import=./data
```

# Deploying

Only do this after merging a pull request:

```bash
firebase deploy
```

This will deploy indexes, and the rules. If more items have been added to this folder, then they might also be deployed.

# Updating the Snapshot

Run the following with the emulators running. Make sure all accounts are deleted so that passwords are not accidentally leaked.

```bash
rm -rf data
firebase emulators:export ./data
```

# Further Reading

- <https://firebase.google.com/docs/cli>
- <https://firebase.google.com/docs/cli/targets>
