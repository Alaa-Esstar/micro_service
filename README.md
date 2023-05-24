# micro_service
node 18.13.0

npm 9.3.0

xampp for mysql

# execute
node ./reunionMicroservice.js

node ./userMicroservice.js

node ./apiGateway.js

# roots
users/ get post {name, email}
users/id get put {name, email} delet {id}

reunions/ get post {sujet, date, location, user_ids}
reunions/ get put {sujet, date, location, user_ids} delet {id}

