This is the infrastructure-as-code for Firestore.

# Setup

```bash
npm i -g firebase-tools
firebase login
```

# Running

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
