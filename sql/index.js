var sql = {
	// CREATE
	setNewBook: "INSERT INTO Books(isbn, title, description, pages, img_file_url, publisher_id) VALUES (?, ?, ?, ?, ?, ?);",
	setNewAuthor: "INSERT INTO Authors(last_name, first_name) VALUES (?, ?);",
	setNewGenre: "INSERT INTO Genres(genre_name) VALUES (?);", 
	setNewPublisher: "INSERT INTO Publishers(publisher_name, city, state) VALUES (?, ?, ?);",
	setBookAuthor: "INSERT INTO Book_Authors(isbn, author_id) VALUES (?, ?);",
	setBookGenre: "INSERT INTO Book_Genres(isbn, genre_id) VALUES (?, ?);",
	setBookCopy: "INSERT INTO Book_Copies(isbn, copy_number) VALUES (?, ?);",
	setBookLoan: "INSERT INTO Book_Loans(isbn, copy_number, patron_id, return_date) VALUES (?, ?, ?, ?);",

	// RETRIEVE
	getAvailableCopy: "SELECT MIN(bc.copy_number) AS Available_Copy FROM Book_Copies bc WHERE bc.isbn = ? && bc.copy_number NOT IN ( \
    SELECT bl.copy_number FROM Book_Loans bl WHERE bl.isbn = ?);",

    getBooks: "SELECT b.isbn, b.title, b.description, b.pages, b.img_file_url, p.publisher_name, \
    (SELECT COUNT(bc.isbn) FROM Book_Copies bc WHERE b.isbn = bc.isbn) - \
    (SELECT COUNT(bl.isbn) FROM Book_Loans bl WHERE b.isbn = bl.isbn) AS Copies_Available, \
    CONCAT(a.first_name, ' ', a.last_name) AS Author_Name, g.genre_name FROM Books b \
    INNER JOIN Publishers p ON b.publisher_id = p.publisher_id \
    INNER JOIN Book_Genres bg ON b.isbn = bg.isbn \
    INNER JOIN Genres g ON bg.genre_id = g.genre_id \
    INNER JOIN Book_Authors ba ON b.isbn =  ba.isbn \
    INNER JOIN Authors a ON ba.author_id = a.author_id \
    GROUP BY b.isbn, Author_Name, g.genre_name HAVING Copies_Available > 0 \
    ORDER BY b.title;", 

    getPublishers: "SELECT DISTINCT publisher_id, publisher_name FROM Publishers ORDER BY publisher_name ASC;",

    getAuthors: "SELECT DISTINCT author_id, CONCAT(first_name, ' ', last_name) AS author_name FROM Authors ORDER BY author_name ASC;",

    getPatrons: "SELECT DISTINCT patron_id, CONCAT(first_name, ' ', last_name) AS patron_name FROM Patrons ORDER BY patron_name ASC;",

    getGenres: "SELECT DISTINCT genre_id, genre_name FROM Genres ORDER BY genre_name ASC;",

    getBooksByISBN: "SELECT * FROM Books WHERE isbn = ?",

    getBooksByFilter: "SELECT b.isbn, b.title, b.description, b.pages, b.img_file_url, p.publisher_name, p.publisher_id,  \
    (SELECT COUNT(bc.isbn) FROM Book_Copies bc WHERE b.isbn = bc.isbn) - \
    (SELECT COUNT(bl.isbn) FROM Book_Loans bl WHERE b.isbn = bl.isbn) AS Copies_Available, \
    CONCAT(a.first_name, ' ', a.last_name) AS Author_Name, a.author_id, g.genre_id, g.genre_name FROM Books b \
    INNER JOIN Publishers p ON b.publisher_id = p.publisher_id \
    INNER JOIN Book_Genres bg ON b.isbn = bg.isbn \
    INNER JOIN Genres g ON bg.genre_id = g.genre_id \
    INNER JOIN Book_Authors ba ON b.isbn =  ba.isbn \
    INNER JOIN Authors a ON ba.author_id = a.author_id \
    GROUP BY b.isbn, Author_Name, a.author_id, g.genre_id, g.genre_name HAVING Copies_Available > 0 ",

    getAuthorID: "SELECT author_id FROM Authors WHERE last_name = ? && first_name = ?",

    getGenreID: "SELECT genre_id FROM Genres WHERE genre_name = ?",

    getPublisherID: "SELECT publisher_id FROM Publishers WHERE publisher_name = ?;",
	// UPDATE
	editBookByISBN: "UPDATE Books SET title=?, description=?, pages=?, img_file_url=? WHERE isbn=?;",
	
	// DELETE
	delBookByISBN: "DELETE FROM Books WHERE isbn = ?"
}
module.exports = sql