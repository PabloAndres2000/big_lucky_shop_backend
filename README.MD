1. docker exec -it mongo bash
2. mongosh --username admin --password adminpassword --authenticationDatabase admin
3. use big_lucky_shop_db;
4. create this:
   ´´´
   db.createUser({
   user: "admin",
   pwd: "adminpassword",
   roles: [
   { role: "readWrite", db: "big_lucky_shop_db" }
   ]
   })
   ´´´
