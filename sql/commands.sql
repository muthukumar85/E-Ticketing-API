-- user table query to create table for all users

CREATE TABLE users (
     id MEDIUMINT(255) NOT NULL AUTO_INCREMENT,
     name VARCHAR(100) NOT NULL,
     email VARCHAR(100) NOT NULL,
     password_hash VARCHAR(255) NOT NULL , 
     mobile VARCHAR(255) NOT NULL,
     role VARCHAR(50) NOT NULL , 
     created_by MEDIUMINT(255) NOT NULL,
     PRIMARY KEY (id)
);

-- ticket table for storing tickets

CREATE TABLE tickets(
	ticket_id MEDIUMINT(255) NOT NULL AUTO_INCREMENT,
    user_id MEDIUMINT(255) NOT NULL ,
    client_id MEDIUMINT(255) NOT NULL,
    ticket_status VARCHAR(50) NOT NULL,
    ticket_state VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    attachment LONGBLOB,
    solution VARCHAR(255),
    PRIMARY KEY (ticket_id)
);

-- super admin Creation command

