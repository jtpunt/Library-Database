DROP TABLE IF EXISTS `Book_Copy`;
DROP TABLE IF EXISTS `Book_Author`;
DROP TABLE IF EXISTS `Author`;
DROP TABLE IF EXISTS `Book_Genre`;
DROP TABLE IF EXISTS `Book_Hold`;
DROP TABLE IF EXISTS `Book_Reservation`;
DROP TABLE IF EXISTS `Book`;
DROP TABLE IF EXISTS `Publisher`;
DROP TABLE IF EXISTS `Genre`;
DROP TABLE IF EXISTS `Patron`;

/* Get Data Procedures */
DROP PROCEDURE IF EXISTS sp_get_current_books;
DROP PROCEDURE IF EXISTS sp_get_publishers;
DROP PROCEDURE IF EXISTS sp_get_authors;
DROP PROCEDURE IF EXISTS sp_get_patrons;
DROP PROCEDURE IF EXISTS sp_get_genres;
DROP PROCEDURE IF EXISTS sp_get_holds;

/* Get Data By Parameter(s) Procedures */
DROP PROCEDURE IF EXISTS sp_get_book_by_isbn;
DROP PROCEDURE IF EXISTS sp_get_current_book_by_isbn;
DROP PROCEDURE IF EXISTS sp_get_author_by_full_name;
DROP PROCEDURE IF EXISTS sp_get_genre_by_name;
DROP PROCEDURE IF EXISTS sp_get_publisher_by_name;
DROP PROCEDURE IF EXISTS sp_get_book_holds_by_patron_id;
DROP PROCEDURE IF EXISTS sp_get_reserve_date_by_isbn_and_patron_id;
DROP PROCEDURE IF EXISTS sp_get_books_reserved_by_patron_id;
DROP PROCEDURE IF EXISTS sp_get_available_copy_num_by_isbn;
DROP PROCEDURE IF EXISTS sp_get_patron_by_patron_id;
DROP PROCEDURE IF EXISTS sp_get_patron_by_email_and_pass;

/* Insert Data Procedures */
DROP PROCEDURE IF EXISTS sp_insert_book;
DROP PROCEDURE IF EXISTS sp_insert_author;
DROP PROCEDURE IF EXISTS sp_insert_genre;
DROP PROCEDURE IF EXISTS sp_insert_publisher;
DROP PROCEDURE IF EXISTS sp_insert_book_author;
DROP PROCEDURE IF EXISTS sp_insert_book_genre;
DROP PROCEDURE IF EXISTS sp_insert_book_copy;
DROP PROCEDURE IF EXISTS sp_insert_book_hold;
DROP PROCEDURE IF EXISTS sp_insert_book_reservation;

/* Delete Data Procedures */
DROP PROCEDURE IF EXISTS sp_delete_book_by_isbn;
DROP PROCEDURE IF EXISTS sp_delete_book_hold_by_isbn_copy_num_and_patron_id;
DROP PROCEDURE IF EXISTS sp_delete_book_reservation_by_isbn_and_patron_id;

/* Update Data Procedures */
DROP PROCEDURE IF EXISTS sp_update_book;

CREATE TABLE Publisher(
  publisher_id   int          NOT NULL AUTO_INCREMENT,
  publisher_name varchar(255) NOT NULL,
  city           varchar(50)  NOT NULL,
  state          varchar(50)  NOT NULL,
  CONSTRAINT unique_Publishers UNIQUE(publisher_id, publisher_name),
  PRIMARY KEY (publisher_id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE Book(
  isbn          varchar(10)  NOT NULL,
  title         varchar(100) NOT NULL,
  description   text         NOT NULL,
  pages         int          NOT NULL,
  img_file_url  text         NOT NULL,
  publisher_id  int          NOT NULL,
  PRIMARY KEY (isbn),
  FOREIGN KEY (publisher_id) REFERENCES Publisher(publisher_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE Book_Copy(
  isbn          varchar(10) NOT NULL,
  copy_number   int     NOT NULL,
  CONSTRAINT unique_Book_Copy UNIQUE(isbn, copy_number),
  PRIMARY KEY(isbn, copy_number),
  FOREIGN KEY(isbn) REFERENCES Book(isbn) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE Author(
  author_id  int          NOT NULL AUTO_INCREMENT,
  last_name  varchar(255) NOT NULL,
  first_name varchar(255) NOT NULL,
  CONSTRAINT unique_Author UNIQUE(first_name, last_name),
  PRIMARY KEY (author_id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE Book_Author(
  isbn       varchar(10)      NOT NULL,
  author_id  int          NOT NULL,
  CONSTRAINT unique_Book_Author UNIQUE(isbn, author_id),
  PRIMARY KEY (isbn, author_id),
  FOREIGN KEY (isbn) REFERENCES Book(isbn) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (author_id) REFERENCES Author(author_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE Genre(
  genre_id   int          NOT NULL AUTO_INCREMENT,
  genre_name varchar(255) NOT NULL,
  CONSTRAINT unique_Genre UNIQUE(genre_id, genre_name),
  PRIMARY KEY (genre_id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE Book_Genre(
  isbn     varchar(10) NOT NULL,
  genre_id int     NOT NULL,
  CONSTRAINT unique_Book_Genre UNIQUE(isbn, genre_id),
  PRIMARY KEY (isbn, genre_id),
  FOREIGN KEY (isbn) REFERENCES Book(isbn) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (genre_id) REFERENCES Genre(genre_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE Patron(
  patron_id        int        	NOT NULL AUTO_INCREMENT,
  last_name        varchar(255) NOT NULL,
  first_name       varchar(255) NOT NULL,
  email            varchar(255) NOT NULL,
  password         varchar(10)  NOT NULL,
  admin_permission BOOLEAN      NOT NULL,
  address          varchar(255) NOT NULL,
  city             varchar(255) NOT NULL,
  zipcode          int(6)       NOT NULL,
  CONSTRAINT unique_Patron UNIQUE(first_name, last_name),
  CONSTRAINT unique_Email   UNIQUE(email),
  PRIMARY KEY (patron_id)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE Book_Hold(
  isbn        varchar(10)  NOT NULL,
  copy_number int      NOT NULL,
  patron_id   int      NOT NULL,
  return_date datetime     NOT NULL,
  CONSTRAINT unique_Book_Hold UNIQUE(isbn, copy_number),
  PRIMARY KEY (isbn, copy_number),
  FOREIGN KEY (isbn) REFERENCES Book(isbn) ON DELETE CASCADE ON UPDATE CASCADE,
  -- FOREIGN KEY (copy_number) REFERENCES Book_Copy(copy_number) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (patron_id) REFERENCES Patron(patron_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE Book_Reservation(
  isbn  varchar(10) NOT NULL,
  patron_id int NOT NULL,
  reserve_date datetime NOT NULL,
  PRIMARY KEY (isbn, patron_id),
  FOREIGN KEY (isbn) REFERENCES Book(isbn) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (patron_id) REFERENCES Patron(patron_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/***********************
* Patron Inserts
***********************/
INSERT INTO Patron(last_name, first_name, email, password, admin_permission, address, city, zipcode) VALUES ('Perry', 'Jonathan', 'jonathan.perry1994@gmail.com', 'password', 1, '3560 Country Square Dr', 'Carrollton', 75006);
INSERT INTO Patron(last_name, first_name, email, password, admin_permission, address, city, zipcode) VALUES ('Pinkerton', 'Mike', 'mike.pinkerton@gmail.com', 'password', 0, '923 W Sycamore St', 'Denton', 76201);
/***********************
* Genre Inserts
***********************/
INSERT INTO Genre(genre_name) VALUES ('Science Fiction');
INSERT INTO Genre(genre_name) VALUES ('Fantasy');
INSERT INTO Genre(genre_name) VALUES ('Travel');
/***********************
* Authors Inserts
***********************/
INSERT INTO Author(last_name, first_name) VALUES ('Weir', 'Andy');
INSERT INTO Author(last_name, first_name) VALUES ('Rowling', 'Joanne');
INSERT INTO Author(last_name, first_name) VALUES ('Ilgunas', 'Ken');
INSERT INTO Author(last_name, first_name) VALUES ('Brown', 'Daniel');
INSERT INTO Author(last_name, first_name) VALUES ('Martin', 'George');
/***********************
* Publishers Inserts
***********************/
INSERT INTO Publisher(publisher_name, city, state) VALUES ('Crown', 'New York City', 'New York');
INSERT INTO Publisher(publisher_name, city, state) VALUES ('Scholastic', 'New York City', 'New York');
INSERT INTO Publisher(publisher_name, city, state) VALUES ('Author A. Levine', 'New York City', 'New York');
INSERT INTO Publisher(publisher_name, city, state) VALUES ('Amazon Publishing', 'Seattle', 'Washington');
INSERT INTO Publisher(publisher_name, city, state) VALUES ('William Morrow', 'New York City', 'New York');
INSERT INTO Publisher(publisher_name, city, state) VALUES ('Bantam', 'New York City', 'New York');
/***********************
* Book Inserts
***********************/
INSERT INTO Book(isbn, title, description, pages, img_file_url, publisher_id) VALUES ('0553448129', 'Artemis: A Novel', 
  'Artemis is a 2017 science fiction novel written by Andy Weir. The novel takes place in the late 2080s and is set in Artemis, the first and only city on the moon. 
  It follows the life of porter and smuggler Jasmine ("Jazz") Bashara, as she gets caught up in a conspiracy for control of the city.', 320, 'https://images-na.ssl-images-amazon.com/images/I/41rdzW8wCHL._SX327_BO1,204,203,200_.jpg', 
  (SELECT publisher_id FROM Publisher WHERE publisher_name = 'Crown')
);
INSERT INTO Book(isbn, title, description, pages, img_file_url, publisher_id) VALUES ('0439064864', 'Harry Potter and the Chamber of Secrets', 
  'Between the new spirit spooking his school and the mysterious forces that turn students into stone, Harry has a lot on his mind as he begins his second year at 
   Hogwarts School of Witchcraft and Wizardry.' , 352, 'https://images-na.ssl-images-amazon.com/images/I/51OihdkhSBL._SX329_BO1,204,203,200_.jpg', 
  (SELECT publisher_id FROM Publisher WHERE publisher_name = 'Scholastic')
);
INSERT INTO Book(isbn, title, description, pages, img_file_url, publisher_id) VALUES ('0747551006', 'Harry Potter and the Order of the Phoenix', 
  'Kreacher, the Black house elf, tells Harry that Sirius is at the Ministry of Magic. Harry returns to Hogwarts to find that he and his friends have been caught in Umbridges office. 
  Hermione and Harry convince Umbridge to follow them into the forest, where they claim to be hiding a weapon for Dumbledore.', 896, 'https://images-na.ssl-images-amazon.com/images/I/51Nex9f38rL._SX322_BO1,204,203,200_.jpg', 
  (SELECT publisher_id FROM Publisher WHERE publisher_name = 'Author A. Levine')
);
INSERT INTO Book(isbn, title, description, pages, img_file_url, publisher_id) VALUES ('0439136350', 'Harry Potter and the Prisoner of Azkaban', 
  'The book follows Harry Potter, a young wizard, in his third year at Hogwarts School of Witchcraft and Wizardry. Along with friends Ronald Weasley and Hermione Granger, Harry investigates 
  Sirius Black, an escaped prisoner from Azkaban who they believe is one of Lord Voldemort''s old allies.', 435, 'https://images-na.ssl-images-amazon.com/images/I/51-rbiAIiRL._SX341_BO1,204,203,200_.jpg', 
  (SELECT publisher_id FROM Publisher WHERE publisher_name = 'Scholastic')
);
INSERT INTO Book(isbn, title, description, pages, img_file_url, publisher_id) VALUES ('1469283298', 'Walden on Wheels: On The Open Road from Debt to Freedom', 
  'In this frank and witty memoir, Ken Ilgunas lays bare the existential terror of graduating from the University of Buffalo with $32,000 of student debt. Ilgunas set himself an ambitious mission: 
  get out of debt as quickly as possible. Inspired by the frugality and philosophy of Henry David Thoreau, Ilgunas undertook a 3-year transcontinental journey, working in Alaska as a tour guide, 
  garbage picker, and night cook to pay off his student loans before hitchhiking home to New York. ', 319, 'https://images-na.ssl-images-amazon.com/images/I/51ADULwFjbL._SX323_BO1,204,203,200_.jpg', 
  (SELECT publisher_id FROM Publisher WHERE publisher_name = 'Amazon Publishing')
);
INSERT INTO Book(isbn, title, description, pages, img_file_url, publisher_id) VALUES ('0061348104', 'The Indifferent Stars Above: The Harrowing Saga of a Donner Party Bride', 
  'A chronicle of the mid-nineteenth-century wagon train tragedy draws on the perspectives of one of its survivors, Sarah Graves, recounting how her new husband and she joined the Donner party on 
  their California-bound journey and encountered violent perils, in an account that also offers insight into the scientific reasons that some died while others survived.', 352, 'https://images-na.ssl-images-amazon.com/images/I/51aU58UBJdL._SX330_BO1,204,203,200_.jpg', 
  (SELECT publisher_id FROM Publisher WHERE publisher_name = 'William Morrow')
);
INSERT INTO Book(isbn, title, description, pages, img_file_url, publisher_id) VALUES ('0439784549', 'Harry Potter and the Half-Blood Prince', 
  'Harry Potter, together with Dumbledore, must face treacherous tasks to defeat his evil nemesis. ... As Harry Potter begins his sixth year at Hogwarts, he discovers an old book marked as 
  "the property of the Half-Blood Prince" and begins to learn more about Lord Voldemort''s dark past.', 672, 'https://images-na.ssl-images-amazon.com/images/I/51uO1pQc5oL._SX329_BO1,204,203,200_.jpg', 
  (SELECT publisher_id FROM Publisher WHERE publisher_name = 'Author A. Levine')
);
INSERT INTO Book(isbn, title, description, pages, img_file_url, publisher_id) VALUES ('0553582011', 'A Dance with Dragons (A Song of Ice and Fire)', 
  'A Dance with Dragons picks up where A Storm of Swords left off and runs simultaneously with events in A Feast for Crows. The War of the Five Kings seems to be winding down. In the North, King Stannis 
  Baratheon has installed himself at the Wall and vowed to win the support of the northmen to continue his struggle to claim the Iron Throne, although this is complicated by the fact that much of the west 
  coast is under occupation by the ironborn. On the Wall itself Jon Snow has been elected the 998th Lord Commander of the Night''s Watch, but has enemies both in the Watch and beyond the Wall to watch for. 
  Tyrion Lannister has been taken by ship across the Narrow Sea to Pentos, but his eventual goals are unknown even to him. In the far east, Daenerys Targaryen has conquered the city of Meereen, but has decided 
  to stay and rule the city, honing her skills of leadership which will be needed when she travels on to Westeros. But Daenerys'' presence is now known to many in Westeros, and from the Iron Islands and Dorne, 
  from Oldtown and the Free Cities, emissaries are on their way to find her and use her cause for their own ends. ', 1040, 'https://images-na.ssl-images-amazon.com/images/I/51%2Bd4cQzgPL._SX329_BO1,204,203,200_.jpg', 
  (SELECT publisher_id FROM Publisher WHERE publisher_name = 'Bantam')
);
/***********************
* Book Authors Inserts
***********************/
INSERT INTO Book_Author(isbn, author_id) VALUES ('0553448129',
  (SELECT author_id FROM Author WHERE last_name = 'Weir' && first_name = 'Andy')
);
INSERT INTO Book_Author(isbn, author_id) VALUES ('0439064864',
  (SELECT author_id FROM Author WHERE last_name = 'Rowling' && first_name = 'Joanne')
);
INSERT INTO Book_Author(isbn, author_id) VALUES ('0747551006',
  (SELECT author_id FROM Author WHERE last_name = 'Rowling' && first_name = 'Joanne')
);
INSERT INTO Book_Author(isbn, author_id) VALUES ('0439136350',
  (SELECT author_id FROM Author WHERE last_name = 'Rowling' && first_name = 'Joanne')
);
INSERT INTO Book_Author(isbn, author_id) VALUES ('1469283298',
  (SELECT author_id FROM Author WHERE last_name = 'Ilgunas' && first_name = 'Ken')
);
INSERT INTO Book_Author(isbn, author_id) VALUES ('0061348104',
  (SELECT author_id FROM Author WHERE last_name = 'Brown' && first_name = 'Daniel')
);
INSERT INTO Book_Author(isbn, author_id) VALUES ('0439784549',
  (SELECT author_id FROM Author WHERE last_name = 'Rowling' && first_name = 'Joanne')
);
INSERT INTO Book_Author(isbn, author_id) VALUES ('0553582011',
  (SELECT author_id FROM Author WHERE last_name = 'Martin' && first_name = 'George')
);
/***********************
* Book Genre Inserts
***********************/
INSERT INTO Book_Genre(isbn, genre_id) VALUES ('0553448129', 
  (SELECT genre_id FROM Genre WHERE genre_name = 'Science Fiction')
);
INSERT INTO Book_Genre(isbn, genre_id) VALUES ('0439064864', 
  (SELECT genre_id FROM Genre WHERE genre_name = 'Fantasy')
);
INSERT INTO Book_Genre(isbn, genre_id) VALUES ('0747551006', 
  (SELECT genre_id FROM Genre WHERE genre_name = 'Fantasy')
);
INSERT INTO Book_Genre(isbn, genre_id) VALUES ('0439136350', 
  (SELECT genre_id FROM Genre WHERE genre_name = 'Fantasy')
);
INSERT INTO Book_Genre(isbn, genre_id) VALUES ('1469283298', 
  (SELECT genre_id FROM Genre WHERE genre_name = 'Travel')
);
INSERT INTO Book_Genre(isbn, genre_id) VALUES ('0061348104', 
  (SELECT genre_id FROM Genre WHERE genre_name = 'Travel')
);
INSERT INTO Book_Genre(isbn, genre_id) VALUES ('0439784549', 
  (SELECT genre_id FROM Genre WHERE genre_name = 'Fantasy')
);
INSERT INTO Book_Genre(isbn, genre_id) VALUES ('0553582011', 
  (SELECT genre_id FROM Genre WHERE genre_name = 'Fantasy')
);
/***********************
* Book Copies Inserts
***********************/
INSERT INTO Book_Copy(isbn, copy_number) VALUES ('0553448129', 0);
INSERT INTO Book_Copy(isbn, copy_number) VALUES ('0553448129', 1);
INSERT INTO Book_Copy(isbn, copy_number) VALUES ('0553448129', 2);
INSERT INTO Book_Copy(isbn, copy_number) VALUES ('0553448129', 3);
INSERT INTO Book_Copy(isbn, copy_number) VALUES ('0439064864', 0);
INSERT INTO Book_Copy(isbn, copy_number) VALUES ('0439064864', 1);
INSERT INTO Book_Copy(isbn, copy_number) VALUES ('0439064864', 2);
INSERT INTO Book_Copy(isbn, copy_number) VALUES ('0747551006', 0);
INSERT INTO Book_Copy(isbn, copy_number) VALUES ('0747551006', 1);
INSERT INTO Book_Copy(isbn, copy_number) VALUES ('0747551006', 2);
INSERT INTO Book_Copy(isbn, copy_number) VALUES ('0439136350', 0);
INSERT INTO Book_Copy(isbn, copy_number) VALUES ('0439136350', 1);
INSERT INTO Book_Copy(isbn, copy_number) VALUES ('1469283298', 0);
INSERT INTO Book_Copy(isbn, copy_number) VALUES ('1469283298', 1);
INSERT INTO Book_Copy(isbn, copy_number) VALUES ('1469283298', 2);
INSERT INTO Book_Copy(isbn, copy_number) VALUES ('0061348104', 0);
INSERT INTO Book_Copy(isbn, copy_number) VALUES ('0061348104', 1);
INSERT INTO Book_Copy(isbn, copy_number) VALUES ('0061348104', 2);
INSERT INTO Book_Copy(isbn, copy_number) VALUES ('0439784549', 0);
INSERT INTO Book_Copy(isbn, copy_number) VALUES ('0553582011', 0);
/***********************
* Book Loans Inserts
***********************/
INSERT INTO Book_Hold(isbn, copy_number, patron_id, return_date) VALUES('0553448129', 0, 
  (SELECT patron_id FROM Patron WHERE last_name = 'Perry' && first_name = "Jonathan"), current_timestamp()
);
INSERT INTO Book_Hold(isbn, copy_number, patron_id, return_date) VALUES('0553448129', 3, 
  (SELECT patron_id FROM Patron WHERE last_name = 'Pinkerton' && first_name = "Mike"), current_timestamp()
);

/* 
* Stored Procedures
*/

/* Get Books Procedure */
DELIMITER $$

CREATE PROCEDURE `sp_get_current_books`()
BEGIN
  SELECT b.isbn, b.title, b.description, b.pages, b.img_file_url, p.publisher_name,
  (SELECT COUNT(bc.isbn) FROM Book_Copy bc WHERE b.isbn = bc.isbn) -
  (SELECT COUNT(bh.isbn) FROM Book_Hold bh WHERE b.isbn = bh.isbn) AS Copies_Available,
  CONCAT(a.first_name, ' ', a.last_name) AS Author_Name, g.genre_name FROM Book b
  INNER JOIN Publisher p ON b.publisher_id = p.publisher_id 
  INNER JOIN Book_Genre bg ON b.isbn = bg.isbn 
  INNER JOIN Genre g ON bg.genre_id = g.genre_id 
  INNER JOIN Book_Author ba ON b.isbn =  ba.isbn 
  INNER JOIN Author a ON ba.author_id = a.author_id 
  GROUP BY b.isbn, Author_Name, g.genre_name HAVING Copies_Available >= 0 
  ORDER BY b.title;
END $$

/* Get Publishers Procedure */
DELIMITER $$

CREATE PROCEDURE `sp_get_publishers`()
BEGIN
  SELECT DISTINCT publisher_id, publisher_name FROM Publisher ORDER BY publisher_name ASC;
END $$

/* Get Authors Procedure */
DELIMITER $$

CREATE PROCEDURE `sp_get_authors`()
BEGIN
  SELECT DISTINCT author_id, CONCAT(first_name, ' ', last_name) AS author_name FROM Author ORDER BY author_name ASC;
END $$

/* Get Patrons Procedure */
DELIMITER $$
CREATE PROCEDURE `sp_get_patrons`()
BEGIN
  SELECT DISTINCT patron_id, CONCAT(first_name, ' ', last_name) AS patron_name FROM Patron ORDER BY patron_name ASC;
END $$

/* Get Genres Procedure */
DELIMITER $$
CREATE PROCEDURE `sp_get_genres`()
BEGIN
  SELECT DISTINCT genre_id, genre_name FROM Genre ORDER BY genre_name ASC;
END $$

/* 
    Get All Holds 
    reserve_date column formatted to MM-DD-YYYY hh:mm AM/PM
*/
DELIMITER $$
CREATE PROCEDURE `sp_get_holds`()
BEGIN 
  SELECT bh.isbn, bh.patron_id, b.title, b.img_file_url, bh.copy_number, DATE_FORMAT(bh.return_date, '%m/%d/%Y %h:%i %p') AS return_date, CONCAT(p.first_name, ' ', p.last_name) AS Full_Name FROM Book_Hold bh
  INNER JOIN Patron p ON bh.patron_id = p.patron_id
  INNER JOIN Book b ON bh.isbn = b.isbn;
END $$



/* Get Book By ISBN Procedure */
DELIMITER $$
CREATE PROCEDURE `sp_get_book_by_isbn`(
    in isbn varchar(10)
)
BEGIN
    SELECT * FROM Book b WHERE b.isbn = isbn;
END $$

/* Get Current Book By ISBN Procedure */
DELIMITER $$
CREATE PROCEDURE `sp_get_current_book_by_isbn`(
    in isbn varchar(10)
)
BEGIN
    SELECT b.isbn, b.title, b.description, b.pages, b.img_file_url, p.publisher_name, 
    (SELECT COUNT(bc.isbn) FROM Book_Copy bc WHERE b.isbn = bc.isbn) - 
    (SELECT COUNT(bh.isbn) FROM Book_Hold bh WHERE b.isbn = bh.isbn) AS Copies_Available, 
    CONCAT(a.first_name, ' ', a.last_name) AS Author_Name, g.genre_name FROM Book b 
    INNER JOIN Publisher p ON b.publisher_id = p.publisher_id 
    INNER JOIN Book_Genre bg ON b.isbn = bg.isbn 
    INNER JOIN Genre g ON bg.genre_id = g.genre_id 
    INNER JOIN Book_Author ba ON b.isbn =  ba.isbn 
    INNER JOIN Author a ON ba.author_id = a.author_id 
    WHERE b.isbn = isbn;
END $$

/* Get Author By Author ID Procedure */
DELIMITER $$
CREATE PROCEDURE `sp_get_author_by_full_name`(
    in last_name varchar(255),
    in first_name varchar(255)
)
BEGIN
    SELECT author_id FROM Author WHERE last_name = last_name && first_name = first_name;
END $$

/* Get Genre By Genre ID Procedure */
DELIMITER $$
CREATE PROCEDURE `sp_get_genre_by_name`(
    in genre_name varchar(255)
)
BEGIN
    SELECT genre_id FROM Genre WHERE genre_name = genre_name;
END $$

/* Get Publisher By publisher ID Procedure */
DELIMITER $$
CREATE PROCEDURE `sp_get_publisher_by_name`(
    in publisher_name varchar(255)
)
BEGIN
    SELECT publisher_id FROM Publisher WHERE publisher_name = publisher_name;
END $$

/* Get Books Checked Out By Patron ID Procedure */
DELIMITER $$
CREATE PROCEDURE `sp_get_book_holds_by_patron_id`(
    in patron_id int
)
BEGIN
    SELECT bh.isbn, bh.copy_number, b.title, b.img_file_url, bh.patron_id, DATE_FORMAT(bh.return_date, '%m/%d/%Y %h:%i %p') AS return_date
    FROM Book_Hold bh 
    INNER JOIN Book b ON bh.isbn = b.isbn 
    WHERE bh.patron_id = patron_id;
END $$

/* Get Books Reserved By Patron ID Procedure */
DELIMITER $$
CREATE PROCEDURE `sp_get_reserve_date_by_isbn_and_patron_id`(
    in _isbn      varchar(10),
    in _patron_id int
)
BEGIN
    SELECT reserve_date FROM Book_Reservation WHERE isbn = _isbn AND patron_id = _patron_id;
END $$

/* 
    Get Books Reserved By Patron ID Procedure 
    reserve_date column formatted to MM-DD-YYYY hh:mm AM/PM
*/
DELIMITER $$
CREATE PROCEDURE `sp_get_books_reserved_by_patron_id`(
    in patron_id int
)
BEGIN
    SELECT br.isbn, b.title, b.img_file_url, br.patron_id, DATE_FORMAT(br.reserve_date, '%m/%d/%Y %h:%i %p') AS reserve_date 
    FROM Book_Reservation br
    INNER JOIN Book b ON br.isbn = b.isbn
    WHERE br.patron_id = patron_id;
END $$

/* Get Available Copy Number by isbn*/
DELIMITER $$
CREATE PROCEDURE `sp_get_available_copy_num_by_isbn`(
    in isbn varchar(10)
)
BEGIN
    SELECT MIN(bc.copy_number) AS Available_Copy 
    FROM Book_Copy bc 
    WHERE bc.isbn = isbn && bc.copy_number NOT IN (
        SELECT bh.copy_number FROM Book_Hold bh WHERE bh.isbn = isbn);
END $$

/* Get Patron by patron_id */
DELIMITER $$
CREATE PROCEDURE `sp_get_patron_by_patron_id`(
    in _patron_id int
)
BEGIN
    SELECT * FROM Patron WHERE patron_id = _patron_id LIMIT 1;
END $$
/* Get Patron by email and password */
DELIMITER $$
CREATE PROCEDURE `sp_get_patron_by_email_and_pass`(
    in email    varchar(255),
    in password varchar(10)
)
BEGIN
    SELECT * 
    FROM Patron 
    WHERE email = email AND password = password 
    LIMIT 1;
END $$


/* Insert Book Data */
DELIMITER $$
CREATE PROCEDURE `sp_insert_book`(
    in isbn          varchar(10),
    in title         varchar(100),
    in description   text,
    in pages         int,
    in img_file_url  text
)
BEGIN
    INSERT INTO Book(isbn, title, description, pages, img_file_url, publisher_id) 
    VALUES (isbn, title, description, pages, img_file_url, publisher_id);
END $$

/* Insert Author Data */
DELIMITER $$
CREATE PROCEDURE `sp_insert_author`(
    in last_name  varchar(255),
    in first_name varchar(255)
)
BEGIN
    INSERT INTO Author(last_name, first_name) 
    VALUES (last_name, first_name);
END $$

/* Insert Author Data */
DELIMITER $$
CREATE PROCEDURE `sp_insert_genre`(
    in genre_name varchar(255)
)
BEGIN
    INSERT INTO Genre(genre_name) 
    VALUES (genre_name);
END $$

/* Insert Author Data */
DELIMITER $$
CREATE PROCEDURE `sp_insert_publisher`(
    in publisher_name varchar(255),
    in city           varchar(50),
    in state          varchar(50)
)
BEGIN
    INSERT INTO Publisher(publisher_name, city, state) 
    VALUES (publisher_name, city, state);
END $$


/* Insert Book Author Data */
DELIMITER $$
CREATE PROCEDURE `sp_insert_book_author`(
    in isbn       varchar(10),
    in author_id  int
)
BEGIN
    INSERT INTO Book_Author(isbn, author_id) 
    VALUES (isbn, author_id);
END $$

/* Insert Book Genre Data */
DELIMITER $$
CREATE PROCEDURE `sp_insert_book_genre`(
    in isbn     varchar(10),
    in genre_id int
)
BEGIN
    INSERT INTO Book_Genre(isbn, genre_id) 
    VALUES (isbn, genre_id);
END $$

/* Insert Book Genre Data */
DELIMITER $$
CREATE PROCEDURE `sp_insert_book_copy`(
    in isbn          varchar(10),
    in copy_number   int
)
BEGIN
    INSERT INTO Book_Copy(isbn, copy_number) 
    VALUES (isbn, copy_number);
END $$

/* Insert Book Genre Data */
DELIMITER $$
CREATE PROCEDURE `sp_insert_book_hold`(
    in isbn        varchar(10),
    in copy_number int,
    in patron_id   int,
    in return_date date
)
BEGIN
    INSERT INTO Book_Hold(isbn, copy_number, patron_id, return_date) 
    VALUES (isbn, copy_number, patron_id, return_date);
END $$

/* Insert Book Genre Data */
DELIMITER $$
CREATE PROCEDURE `sp_insert_book_reservation`(
    in isbn         varchar(10),
    in patron_id    int,
    in reserve_date date
)
BEGIN
    INSERT INTO Book_Reservation(isbn, patron_id, reserve_date) 
    VALUES (isbn, patron_id, reserve_date);
END $$


/* Delete Book by isbn */
DELIMITER $$
CREATE PROCEDURE `sp_delete_book_by_isbn`(
    in _isbn varchar(10)
)
BEGIN
    DELETE FROM Book WHERE isbn = _isbn;
END $$

/* Delete Book Loan by isbn and patron id*/
DELIMITER $$
CREATE PROCEDURE `sp_delete_book_hold_by_isbn_copy_num_and_patron_id`(
    in _isbn        varchar(10),
    in _copy_number int,
    in _patron_id   int
)
BEGIN
    DELETE FROM Book_Hold 
    WHERE isbn = _isbn AND copy_number = _copy_number AND patron_id = _patron_id;
END $$

/* Delete Book Loan by isbn and patron id*/
DELIMITER $$
CREATE PROCEDURE `sp_delete_book_reservation_by_isbn_and_patron_id`(
    in _isbn      varchar(10),
    in _patron_id int
)
BEGIN
    DELETE FROM Book_Reservation WHERE isbn = _isbn AND patron_id = _patron_id;
END $$


/* Update book */
DELIMITER $$
CREATE PROCEDURE `sp_update_book`(
    in _title         varchar(100),
    in _description   text,
    in _pages         int,
    in _img_file_url  text,
    in _isbn          varchar(10)
)
BEGIN
    UPDATE Book 
    SET title=_title, description=_description, pages=_pages, img_file_url=_img_file_url 
    WHERE isbn = _isbn;
END $$