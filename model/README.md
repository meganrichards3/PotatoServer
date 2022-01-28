## Quick Start for entire Backend

1. Start the PostgreSQL Server with: `ssh -L 5432:127.0.0.1:5432 vcm-23920.vm.duke.edu -l zz160`
2. To start the backend, cd into `PotatoServer/model/` and type `npm run type-start`.
3. In your browser, go to https://localhost:3000/api/users/all/page=0&size=0&sort=none&sortDir=none to check if the database is working locally!

## BACKEND API

Making a backend API call?

**Tips and Tricks**

- The **Tables are refreshed and restarted on every restart** with clean data each time your `run npm run type-start`. Accidentally delete or add bad data? No problem, just `CTRL C` out of the npm script and rerun it.
- Although status codes are returned; the wrapper should handle all the errors for you

**Examples**
Posting a New User:
` await axios.post("https://localhost:3000/api/users", { email: "NewUniqueEmail@email.net", firstName: "NewFirstName", middleName: "newMiddleName", lastName: "newLastName", address: "new Address", isAdmin: false, password: "testnewpass", });`

Posting a New School:
` await axios.put("https://localhost:3000/api/schools/2", { name: "newnewnew@email.net", address: "NewFirstName", longitude: 1, latitude: 2, });`

Updating an existing User: (note you need the UID)
`await axios.put("https://localhost:3000/api/users/2", { email: "newnewnew@email.net", firstName: "NewFirstName", middleName: "newMiddleName", lastName: "newLastName", address: "new Address", isAdmin: false, password: "testnewpassUpdated", });`

Backend Options; can add additional calls to smooth out operations if needed:

- Can add soft delete / restore

### TODOS

(add onenote todos)

- CONTAINS instead of HAVING/WITH calls on query builder for filter
- front end view/api wrapper for getting front end
- relational info easy calls for view/api
- jira task doc update
- check again the page number offset
- for sending metadata for pagination, use findandCount