# Setting up MongoDB
1. Download it here: https://www.mongodb.com/try/download/community?tck=docs_server&fbclid=IwAR1l9EjS7C6sJBqhvGU9fQN0UTrFosWcm4xgfJGvKr3zevr9XLSzrV-k8jI
2. When selecting the directory to install MongoDB into, choose a directory path that has no spaces. For example, in 'C:\Program Files', there is a space between 'Program' and 'Files', so this would not be good choice for a directory path. 
3. Find the file called 'mongod.exe', which will be in the MongoDB directory. More specifically, the directory path is: (Your directory path)\MongoDB\Server\4.4\bin\mongod.exe. Copy this file path
4. Open Visual Studio Code, open a new terminal and run this command: cd c:\
5. Now run this command: md \data\DB
6. In the terminal, paste the copied directory address in step 3, putting 'mongod.exe' at the end. So it'll look something like this:
(Your directory path)\MongoDB\Server\4.4\bin\mongod.exe. If this is done correctly, it will output multiple lines. The last line should say 
"Waiting for connections","attr":{"port":27017,"ssl":"off"}}"

**Note: mongod.exe is the main MongoDB server. This means that mongod must be running in a terminal to use the application and to use MongoDB Compass**

# Running the application
1. Open a new terminal, but make sure to not close the terminal in 'Setting up MongoDB' step 4. So, 2 terminals should be open at this moment.
1. Pull the files from the main branch
1. run the command `npm ci`
2. run the command 'node index.js'
3. Go to this link: http://localhost:3000/. It should display the login screen

# Running MongoDB compass for seeing the entries in the database
1. Open 'MongoDBCompass.exe'
2. In the top right, click "Fill in connection fields individually"
3. In the bottom right, click "Connect"
4. Click "funchat"
5. Click any of the schemas, for example, "users". If done correctly, all the entries for that schema will be displayed

# Team coding tips
* Use constants instead of numbers. For example, const MAX_USERS = 100;
* Use self-explanatory variable and function names
* For each function, give a short comment of what it does
* If a function has more than 10 lines of code, then split the code among multiple functions
* Make one css file and js file for each screen

# End of project checklist
* Merge JS files into one file
* Merge CSS files into one file
