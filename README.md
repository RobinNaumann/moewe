# mœwe insights

a privacy preserving way to log crashes and other technical information within your projects

### ToDo

- general
  - [x] design landing page
- `studio`
  - [x] style error view
  - [x] user feedback view
  - [x] delete project
  - [x] reset project config
  - [x] disable live updates
  - [x] sign the user out if it was deleted on the server
- `server`
  - [x] limit the number of events per app
  - [x] limit the size of events
  - [x] cascade delete: `project` -> `app` -> `event`&`feedback`
  - [ ] delete all projects where a leaving user is the last member
  - [ ] user sign-up with email verification
- `mœwe_dart`
  - [ ] switch to new app based architecture
  - [ ] implement flag support
