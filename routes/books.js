/*******************************************
* Author: Jonathan Perry
* Date: 04/19/17
* Assignment: CS 340 - Project 
*******************************************/

var express    = require("express"),
    middleware = require("../middleware"),
    router     = express.Router();

router.route('/')
    // CREATE a book
    .post(middleware.isAdmin,
        (req, res) =>{
            var context = {};
            var childCallCount = 0;
            var parentCalls = 0;
            var parentCallCount = 0;
            var flag = false; // false - we have parent table data to insert. true - we only have child table data to insert
            var mysql = req.app.get('mysql');

            // insert data for parent tables (authors, Genre, publishers), which has to be added into the database before other data is added in
            var newAuthorInserts = [req.body.author_lname, req.body.author_fname];
            var newGenreInserts = [req.body.genre_name];
            var newPublisherInserts = [req.body.publisher_name, req.body.city_name, req.body.city_state];

            // insert data for child table which is dependent on the publisher table having an already existing publisher_id
            var bookInserts = [req.body.isbn, req.body.title, req.body.desc, req.body.pages, req.body.img_file_url, req.body.publisher[0]];

            // insert data for child tables which are all dependend on the book table having an already exisitng isbn
            var bookAuthorInserts = [req.body.isbn, req.body.author[0]]; 
            var bookGenreInserts = [req.body.isbn, req.body.genre[0]]; 
            var bookCopiesInserts = [req.body.isbn, req.body.copies];

            // all of these if conditions tell us that we have new parent table data that we are adding into the database before we add in our new book
            if(req.body.author === "Add New Author") parentCalls++;
            if(req.body.genre === "Add New Genre") parentCalls++;
            if(req.body.publisher === "Add New Publisher") parentCalls++;

            // skip ahead to insert data into the Book table, Book_Author, Book_Copy, and Book_Genre tables
            if(req.body.author != "Add New Author" && req.body.genre != "Add New Genre" && req.body.publisher != "Add New Publisher") { 
                flag = true;
                parentComplete();
            }

            if(req.body.author === "Add New Author"){
                insertAuthor(res, mysql, newAuthorInserts, authorComplete);
                function authorComplete(){
                    getAuthorID(res, mysql, newAuthorInserts, context, getAuthorComplete);
                }
                function getAuthorComplete(){
                    bookAuthorInserts[1] = context.author.author_id; // reassign the value of index 1 to our new author_id
                    parentComplete();
                }
            } 
            if(req.body.genre === "Add New Genre"){
                insertGenre(res, mysql, newGenreInserts, genreComplete);
                function genreComplete(){
                    getGenreID(res, mysql, newGenreInserts, context, getGenreComplete);
                }
                function getGenreComplete(){
                    bookGenreInserts[1] = context.genre.genre_id;
                    parentComplete();
                }
            }
            if(req.body.publisher === "Add New Publisher") {
                insertPublisher(res, mysql, newPublisherInserts, publisherComplete); // publisher is the main parent table on which the book table is dependend on
                function publisherComplete(){
                    getPublisherID(res, mysql, req.body.publisher_name, context, getPublisherComplete);
                }
                function getPublisherComplete(){
                    bookInserts[5] = context.publisher.publisher_id;
                    parentComplete();
                }
            }
            function parentComplete(){
                parentCallCount++;
                if(flag === true) parentCallCount = 0;
                if(parentCallCount === parentCalls){
                    insertBook(res, mysql, bookInserts, complete); // FIRST THREE insert statements must EXECUTE before the last 4 or it'll ERROR out
                    function complete(){
                        insertBookAuthor(res, mysql, bookAuthorInserts, finalComplete); // Because we must have a valid ISBN, author_id, genre_id, publisher_id
                        insertBookGenre(res, mysql, bookGenreInserts, finalComplete); // due to foreign key restraints. In other words, these keys must exist in the parent table.           
                        insertBookCopies(res, mysql, bookCopiesInserts, finalComplete);
                    }
                    function finalComplete(){
                        childCallCount++;
                        if(childCallCount >= 3){
                            res.redirect('book');
                        }
                    }
                }
            }
        }
    )
    // RETRIEVE all Book
    .get(
        (req, res) => {
          	let callbackCount = 0,
                mysql         = req.app.get('mysql'),
                context       = {
                    stylesheets: ["/static/css/Book.css"],
                    scripts:  ["/static/js/Book.js"]
                }
            
            getBook(res, mysql, context, complete);
            getPublishers(res, mysql, context, complete);
            getAuthors(res, mysql, context, complete);
            getGenre(res, mysql, context, complete);
            getPatrons(res, mysql, context, complete);
            function complete(){
                callbackCount++;
                if(callbackCount >= 5){
                    res.render('books/index', context);
                }
            }
        }
    )

router.get('/filter',function(req,res){
    let callbackCount = 0,
        mysql         = req.app.get('mysql'),
        context       = {
            stylesheets: ["/static/css/Book.css"],
            scripts:  ["/static/js/Book.js"]
        };
    getBookByFilter(res, mysql, context, req, complete);
    getPublishers(res, mysql, context, complete);
    getAuthors(res, mysql, context, complete);
    getGenre(res, mysql, context, complete);
    getPatrons(res, mysql, context, complete);
    function complete(){
        callbackCount++;
        if(callbackCount >= 5){
            res.render('books/index', context);
        }
    }
});
router.get('/new', middleware.isAdmin, function(req,res){
    let callbackCount = 0,
        mysql         = req.app.get('mysql'),
        context       = {
            stylesheets: ["/static/css/addBook.css"],
            scripts:  ["/static/js/addBook.js"]
        };
    getPublishers(res, mysql, context, complete);
    getAuthors(res, mysql, context, complete);
    getGenre(res, mysql, context, complete);
    function complete(){
        callbackCount++;
        console.log("in complete");
        if(callbackCount >= 3){
            res.render('books/new', context);
        }
    }
});
router.route('/:isbn')
    // CREATE a book loan by isbn 
    .post(middleware.isLoggedIn,
        (req, res) =>{
            let context = {},
                mysql   = req.app.get('mysql');
            console.log(`in POST -> /${req.body.isbn}`);
            // this function returns an available copy number for the book that's being loaned out
            getAvailableCopy(res, mysql, [req.body.isbn, req.body.isbn], context, complete);
            function complete(){
                var inserts = [req.body.isbn.toString(), context.Available, req.session.patron_id, '2017-12-01'];
                insertBookLoan(res, mysql, inserts, finalComplete)
            }
            function finalComplete(){
                // WARNING: Initially did not work on OSU server for some reason
                //res.redirect(req.get('referer')); // refreshed the current page
                res.end();
            }
        }
    )
    // Retrieve a book by isbn
    .get(
        (req, res) => {
            let mysql          = req.app.get('mysql'),
                isbnParam      = req.params.isbn,
                //getBookByISBN = "SELECT * FROM Book WHERE isbn = ?",
                getBookByISBN = "SELECT b.isbn, b.title, b.description, b.pages, b.img_file_url, p.publisher_name, \
                (SELECT COUNT(bc.isbn) FROM Book_Copy bc WHERE b.isbn = bc.isbn) - \
                (SELECT COUNT(bl.isbn) FROM Book_Loan bl WHERE b.isbn = bl.isbn) AS Copies_Available, \
                CONCAT(a.first_name, ' ', a.last_name) AS Author_Name, g.genre_name FROM Book b \
                INNER JOIN Publisher p ON b.publisher_id = p.publisher_id \
                INNER JOIN Book_Genre bg ON b.isbn = bg.isbn \
                INNER JOIN Genre g ON bg.genre_id = g.genre_id \
                INNER JOIN Book_Author ba ON b.isbn =  ba.isbn \
                INNER JOIN Author a ON ba.author_id = a.author_id \
                WHERE b.isbn = ?;"
                context        = {
                    stylesheets: ["/static/css/addBook.css"],
                    scripts:  ["/static/js/Book.js"]
                },
                inserts = [isbnParam, isbnParam];
            console.log("Show book route");
            mysql.pool.query(getBookByISBN, isbnParam, function(error, results, fields){
                if(error){
                    console.log(`error: ${JSON.stringify(error)}`);
                    res.write(JSON.stringify(error));
                    res.end();
                }else
                    console.log(`results: ${JSON.stringify(results)}`);
                    context.book = results[0];             
                    res.render('books/show', context);
            });
        }
    )
    // updates a book by the isbn given in the URI parameter
    .put(middleware.isAdmin,
        (req, res) => {
            let mysql          = req.app.get('mysql'),
                inserts        = [req.body.title, req.body.desc, req.body.pages, req.body.img_file_url, req.body.isbn],
                editBookByISBN = "UPDATE Book SET title=?, description=?, pages=?, img_file_url=? WHERE isbn=?;";
            mysql.pool.query(editBookByISBN, inserts, function(error, results, fields){
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                }else{
                    res.status(200);
                    res.redirect("/book");
                }
            });
        }
    )
    // Delete a book by isbn
    .delete(middleware.isAdmin,
        (req, res) => {
            let mysql         = req.app.get('mysql'),
                inserts       = [req.params.id],
                delBookByISBN = "DELETE FROM Book WHERE isbn = ?";
            mysql.pool.query(delBookByISBN, req.body.isbn, function(error, results, fields){
                if(error){
                    res.write(JSON.stringify(error));
                    res.status(400).end();
                }
                res.end();
            });
        }
    );
router.route('/:isbn/checkout')
    // Processes the book checkout for the user
    .post(middleware.isLoggedIn,
        (req, res) => {

        }
    )
    // Retrieve the book's checkout page
    .get(middleware.isLoggedIn,
        (req, res) => {

        }
    )

/* Display one book for the specific purpose of updating information in that book */
router.get('/:isbn/edit', middleware.isAdmin, function(req,res){
    let mysql          = req.app.get('mysql'),
        isbnParam      = req.params.isbn,
        getBookByISBN = "SELECT * FROM Book WHERE isbn = ?",
        context        = {
            stylesheets: [],
            scripts:  ["/static/js/updatebook.js"]
        };
    console.log("Edit book route");
    mysql.pool.query(getBookByISBN, isbnParam, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }else
            context.book = results[0];             
            res.render('books/edit', context);
    });
});

router.get(`/:isbn/notify`, middleware.isLoggedIn, function(req, res){
    
})
module.exports = router;

function insertBook(res, mysql, inserts, complete){
    var setNewBook = "INSERT INTO Book(isbn, title, description, pages, img_file_url, publisher_id) VALUES (?, ?, ?, ?, ?, ?);";
    mysql.pool.query(setNewBook, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        complete();
    });
}
function insertAuthor(res, mysql, inserts, complete){
    var setNewAuthor = "INSERT INTO Author(last_name, first_name) VALUES (?, ?);";
    mysql.pool.query(setNewAuthor, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        complete();
    });
}
function insertGenre(res, mysql, inserts, complete){
    var setNewGenre = "INSERT INTO Genre(genre_name) VALUES (?);";
    mysql.pool.query(setNewGenre, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        complete();
    });
}
function insertPublisher(res, mysql, inserts, complete){
    var setNewPublisher = "INSERT INTO Publisher(publisher_name, city, state) VALUES (?, ?, ?);";
    mysql.pool.query(setNewPublisher, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        complete();
    });

}
function insertBookAuthor(res, mysql, inserts, complete) {
    var setBookAuthor = "INSERT INTO Book_Author(isbn, author_id) VALUES (?, ?);";
    mysql.pool.query(setBookAuthor, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        complete();
    });
}
function insertBookGenre(res, mysql, inserts, complete){
    var setBookGenre = "INSERT INTO Book_Genre(isbn, genre_id) VALUES (?, ?);";
    mysql.pool.query(setBookGenre, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        complete();
    });
}
function insertBookCopies(res, mysql, inserts, complete){
    var setBookCopy = "INSERT INTO Book_Copy(isbn, copy_number) VALUES (?, ?);";
    for(var i = 0; i < inserts[1]; i++){
        var newInserts = [inserts[0], i]; // isbn at index 0, current iteration as the current copy number
        mysql.pool.query(setBookCopy, newInserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
        });
    }
    complete();
}
function insertBookLoan(res, mysql, inserts, complete){
    inserts.forEach(function(value){
        console.log(value);
    })
    var setBookLoan = "INSERT INTO Book_Loan(isbn, copy_number, patron_id, return_date) VALUES (?, ?, ?, ?);";
    mysql.pool.query(setBookLoan, inserts, function(error, results, fields){
        if(error){
            console.log(`error: ${JSON.stringify(error)}`);
            res.write(JSON.stringify(error));
            res.end();
        }
        console.log(`results: ${JSON.stringify(results)}`)
        complete();
    });
}
function getAvailableCopy(res, mysql, isbn, context, complete){
    var getAvailableCopy = "SELECT MIN(bc.copy_number) AS Available_Copy FROM Book_Copy bc WHERE bc.isbn = ? && bc.copy_number NOT IN ( \
    SELECT bl.copy_number FROM Book_Loan bl WHERE bl.isbn = ?);";
    mysql.pool.query(getAvailableCopy, isbn, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.Available = results[0].Available_Copy;
        console.log("Got available copy. Returning");
        complete();
    });
}
function getBook(res, mysql, context, complete){
    var getBook = "SELECT b.isbn, b.title, b.description, b.pages, b.img_file_url, p.publisher_name, \
    (SELECT COUNT(bc.isbn) FROM Book_Copy bc WHERE b.isbn = bc.isbn) - \
    (SELECT COUNT(bl.isbn) FROM Book_Loan bl WHERE b.isbn = bl.isbn) AS Copies_Available, \
    CONCAT(a.first_name, ' ', a.last_name) AS Author_Name, g.genre_name FROM Book b \
    INNER JOIN Publisher p ON b.publisher_id = p.publisher_id \
    INNER JOIN Book_Genre bg ON b.isbn = bg.isbn \
    INNER JOIN Genre g ON bg.genre_id = g.genre_id \
    INNER JOIN Book_Author ba ON b.isbn =  ba.isbn \
    INNER JOIN Author a ON ba.author_id = a.author_id \
    GROUP BY b.isbn, Author_Name, g.genre_name HAVING Copies_Available >= 0 \
    ORDER BY b.title;";
    mysql.pool.query(getBook, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.Books = results;
        //appendImagePath(context.Book); // we need /static/images/ to be placed before the image file's name
        complete();
    });
}
function getPublishers(res, mysql, context, complete){
    var getPublishers = "SELECT DISTINCT publisher_id, publisher_name FROM Publisher ORDER BY publisher_name ASC;";
    mysql.pool.query(getPublishers, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.Publishers = results;
        complete();
    });
}
function getAuthors(res, mysql, context, complete){
    var getAuthors = "SELECT DISTINCT author_id, CONCAT(first_name, ' ', last_name) AS author_name FROM Author ORDER BY author_name ASC;";
    mysql.pool.query(getAuthors, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.Authors = results;
        complete();
    });
}
function getPatrons(res, mysql, context, complete){
    var getPatrons = "SELECT DISTINCT patron_id, CONCAT(first_name, ' ', last_name) AS patron_name FROM Patron ORDER BY patron_name ASC;";
    mysql.pool.query(getPatrons, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.Patrons = results;
        complete();
    });
}
function getGenre(res, mysql, context, complete){
    var getGenre = "SELECT DISTINCT genre_id, genre_name FROM Genre ORDER BY genre_name ASC;";
    mysql.pool.query(getGenre, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.Genres = results;
        complete();
    });
}
function getBookByFilter(res, mysql, context, req, complete){
    var sqlCommand = "SELECT b.isbn, b.title, b.description, b.pages, b.img_file_url, p.publisher_name, p.publisher_id,  \
    (SELECT COUNT(bc.isbn) FROM Book_Copy bc WHERE b.isbn = bc.isbn) - \
    (SELECT COUNT(bl.isbn) FROM Book_Loan bl WHERE b.isbn = bl.isbn) AS Copies_Available, \
    CONCAT(a.first_name, ' ', a.last_name) AS Author_Name, a.author_id, g.genre_id, g.genre_name FROM Book b \
    INNER JOIN Publisher p ON b.publisher_id = p.publisher_id \
    INNER JOIN Book_Genre bg ON b.isbn = bg.isbn \
    INNER JOIN Genre g ON bg.genre_id = g.genre_id \
    INNER JOIN Book_Author ba ON b.isbn =  ba.isbn \
    INNER JOIN Author a ON ba.author_id = a.author_id \
    GROUP BY b.isbn, Author_Name, a.author_id, g.genre_id, g.genre_name HAVING Copies_Available ";
    console.log(`req.query: ${JSON.stringify(req.query)}`);
    for(p in req.query){ 
        var table;
        console.log(`p - ${p}`);
        if(p === "showAllBookCb"){
            console.log("showAllBookCb")
            sqlCommand += " >= 0 "
        }
        else if( p === "showAvailableBookCb"){
            console.log("showAvailableBookCb");
            sqlCommand += " > 0 ";
        }else{
            // search by title, author, or publisher name
            if(p === "wildcard"){
                console.log(`wildcard: ${req.query[p]}`);
                sqlCommand += ("&& " + "b.title" + " LIKE '" + req.query[p] + "%' ")
                sqlCommand += ("|| " + "Author_Name" + " LIKE '" + req.query[p] + "%' ")
                sqlCommand += ("|| " + "p.publisher_name" + " LIKE '" + req.query[p] + "%' ")
            }else{ // search from publisher, genre or author drop down menus
                if(p === "publisher_id")   table = "p."
                else if(p === "genre_id")  table = "g."
                else if(p === "author_id") table = "a."
                sqlCommand += ("&& " + table + p + " = " + req.query[p] + " ");
            }
        }
    }
    sqlCommand += "ORDER BY b.title;";
    console.log(`sqlCommand: ${sqlCommand}`);
    mysql.pool.query(sqlCommand, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.Books = results;
        complete();
    });
}
function getAuthorID(res, mysql, inserts, context, complete){
    var getAuthorID = "SELECT author_id FROM Author WHERE last_name = ? && first_name = ?";
    mysql.pool.query(getAuthorID, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.author = results[0];    
        complete();
    });
}
function getGenreID(res, mysql, inserts, context, complete){
    var getGenreID = "SELECT genre_id FROM Genre WHERE genre_name = ?";
    mysql.pool.query(getGenreID, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.genre = results[0];
        complete();
    });
}
function getPublisherID(res, mysql, inserts, context, complete){
    var getPublisherID = "SELECT publisher_id FROM Publisher WHERE publisher_name = ?;";
    mysql.pool.query(getPublisherID, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.publisher = results[0];
        complete();
    });
}