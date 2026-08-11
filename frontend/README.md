# Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.1.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.




Viewed userController.js:1-100
Searched for "admin"
Searched for "admin"
Listed directory backend
Listed directory src
Viewed index.js:1-68
Viewed db.js:1-14
Viewed .env:1-9
Viewed authController.js:1-222
Viewed package.json:1-29
Viewed User.js:1-140
Viewed reportRoutes.js:1-11
Listed directory app
Viewed app.routes.ts:1-91
Listed directory features
Searched for "ADMIN"
Viewed userRoutes.js:1-27
Listed directory reports
Viewed reports.component.html:1-99
Searched for "role"
Listed directory Finot
Viewed auth.service.ts:1-165
Ran command: `node -e "const mongoose = require('mongoose'); const User = require('./src/models/User'); mongoose.connect('mongodb://localhost:27017/finot-db').then(async () => { const users = await User.find({}, 'username email role isActive'); console.log('USERS:', users); mongoose.disconnect(); }).catch(err => { console.error('DB Error:', err.message); process.exit(1); });"`
Viewed role.guard.ts:1-21
Ran command: `node -e "const mongoose = require('mongoose'); const User = require('./src/models/User'); mongoose.connect('mongodb://localhost:27017/finot-db').then(async () => { const res = await User.updateOne({ username: 'admin' }, { role: 'ADMIN' }); console.log('UPDATE RESULT:', res); mongoose.disconnect(); }).catch(err => { console.error('DB Error:', err.message); process.exit(1); });"`
Ran command: `node -e "const mongoose = require('mongoose'); const User = require('./src/models/User'); mongoose.connect('mongodb://localhost:27017/finot-db').then(async () => { const user = await User.findOne({ username: 'admin' }); if(user) { user.password = 'Admin123!'; await user.save(); console.log('Admin password updated successfully'); } mongoose.disconnect(); }).catch(err => { console.error('DB Error:', err.message); process.exit(1); });"`
Listed directory main-layout
Viewed main-layout.component.html:1-145

To log in as an administrator and access the system reports, follow the steps below:

---

### 1. Admin Login Credentials

The `admin` account in your database has been configured with `ADMIN` privileges and the following credentials:

- **Username / Email**: `admin` (or `tewodrosniguse2287@gmail.com`)
- **Password**: `Admin123!`

---

### 2. How to Log In as Admin

1. Open your browser and navigate to **[http://localhost:4200/auth/login](http://localhost:4200/auth/login)**.
2. *(If you are currently signed in as a standard user, click **Sign Out** at the bottom of the left sidebar first).*
3. Enter `admin` in the **Username or Email** field and `Admin123!` in the **Password** field.
4. Click **Sign In**.

---

### 3. How to Access and View Reports

1. Upon successful login, you will be redirected to the **Admin Dashboard**.
2. Look at the left sidebar under the **Management** section and click on **Reports** (or visit **[http://localhost:4200/reports](http://localhost:4200/reports)**).
3. On the **System Reports** page, you can:
   - **Select Report**: Choose a dataset (e.g., *User List Registry*, *Active vs Inactive*, *Demographics*, or *Audit Trail*).
   - **Preview Data**: A live preview of the top 10 records will render on the right panel.
   - **Select Format**: Choose **CSV**, **EXCEL**, or **PDF**.
   - **Download**: Click **Download File** to generate and save the report.
