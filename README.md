# Knight Companion

A desktop application built with electron to act as an in-game companion app for the game Elite Dangerous. It provides live data on your in-game activities, integrates with a Discord bot to provide chat alerts for important in-game events and uploads data to EDDN to feed the data that powers a plethora of other apps.

# Release

1. Create a [Github Personal Access Token](https://github.com/settings/tokens/new) and add it to your environment variables as `GH_TOKEN`
2. Commit your changes to a new branch and increment the version in `package.json`
3. Create a PR for your changes and merge once approved
4. create a DRAFT release using the new version number from `package.json` prefixed with a 'v' as the tag and without the 'v' prefix as the title. e.g. if you are releasing 1.2.3 then the **TAG** should be `v1.2.3` and the **TITLE** should be `1.2.3`
5. Run `npm run release` which will upload the installers to your release
6. Once complete (and you've confirmed the installers are attached to the release) you can publish the draft release.
