/*******************************************
* Author: Jonathan Perry
* Date: 04/19/17
* Assignment: CS 340 - Project 
*******************************************/

var express    = require("express"),
    middleware = require("../middleware"),
    latex      = require("../LaTeX"),
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
            console.log(`in post -> /books`);
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
                    authors: [],
                    books: [],
                    genres: [],
                    publishers: [],
                    holds: [],
                    stylesheets: ["/static/css/books.css"],
                    scripts:  ["/static/js/books.js"],
                },
                numOfCallBacks = (req.session.patron_id ? 6 : 5);
            
            getBooks(res, mysql, context, complete);
            getPublishers(res, mysql, context, complete);
            getAuthors(res, mysql, context, complete);
            getGenre(res, mysql, context, complete);
            getPatrons(res, mysql, context, complete);
            // if the patron is logged in, get all the books checked out by them
            if(req.session.patron_id){
                let inserts = [req.session.patron_id];
                getBooksCheckedOutByPatron(res, mysql, inserts, context, complete);
            }
            function complete(){
                callbackCount++;
                if(callbackCount >= numOfCallBacks){
                    res.render('books/index', context);
                }
            }
        }
    )

router.get('/filter',function(req,res){
    let callbackCount = 0,
        mysql         = req.app.get('mysql'),
        context       = {
            authors: [],
            books: [],
            genres: [],
            publishers: [],
            holds: [],
            stylesheets: ["/static/css/books.css"],
            scripts:  ["/static/js/books.js"],
        },
        numOfCallBacks = (req.session.patron_id ? 6 : 5);

    getBookByFilter(res, mysql, context, req, complete);
    getPublishers(res, mysql, context, complete);
    getAuthors(res, mysql, context, complete);
    getGenre(res, mysql, context, complete);
    getPatrons(res, mysql, context, complete);
    // if the patron is logged in, get all the books checked out by them
    if(req.session.patron_id){
        let inserts = [req.session.patron_id];
        getBooksCheckedOutByPatron(res, mysql, inserts, context, complete);
    }
    function complete(){
        callbackCount++;
        if(callbackCount >= numOfCallBacks){
            res.render('books/index', context);
        }
    }
});
router.get('/new', middleware.isAdmin, function(req,res){
    let callbackCount = 0,
        mysql         = req.app.get('mysql'),
        context       = {
            stylesheets: ["/static/css/addBooks.css"],
            scripts:  ["/static/js/addBooks.js"]
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
    // Retrieve a book by isbn
    .get(
        (req, res) => {
            let mysql          = req.app.get('mysql'),
                patron_id      = req.session.patron_id,
                isbnParam      = req.params.isbn,
                context        = {
                    stylesheets: ["/static/css/addBooks.css"],
                    scripts:  ["/static/js/books.js"]
                };
            console.log("Show book route");

            getBookByIsbn(res, mysql, isbnParam, context, complete);

            function complete(){
               if(patron_id){
                    let inserts = [isbnParam, patron_id],
                        sql     = `CALL sp_get_reserve_date_by_isbn_and_patron_id(?, ?)`;

                    mysql.pool.query(sql, inserts, function(error1, results1, fields1){
                        if(error1){
                            console.log(`error: ${JSON.stringify(error1)}`);
                            res.write(JSON.stringify(error1));
                            res.end();
                        }else if(results1.length === 0){
                            console.log(`no results: ${JSON.stringify(results1)}`);
                        }
                        else{
                            console.log(`date results: ${JSON.stringify(results1)}`);
                            // make sure results were found
                            if(results1[0].length && results1[0][0]['reserve_date']){
                                let date = new Date(results1[0][0]['reserve_date']),
                                    reserve_date = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
                                context.book.reserve_date = reserve_date;
                            }
                        }
                        res.render('books/show', context);
                    });
                } else{            
                    res.render('books/show', context);
                }
            }
        }
    )
    // updates a book by the isbn given in the URI parameter
    .put(middleware.isAdmin,
        (req, res) => {
            let mysql   = req.app.get('mysql'),
                inserts = [req.body.title, req.body.desc, req.body.pages, req.body.img_file_url, req.body.isbn],
                sql     = `CALL sp_update_book(?, ?, ?, ?, ?)`;
                
            mysql.pool.query(sql, inserts, function(error, results, fields){
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
            let mysql = req.app.get('mysql'),
                isbn  = req.params.isbn,
                sql   = `CALL sp_delete_book_by_isbn(?)`;
            mysql.pool.query(sql, isbn, function(error, results, fields){
                if(error){
                    res.write(JSON.stringify(error));
                    res.status(400).end();
                }
                res.end();
            });
        }
    );

/* Display one book for the specific purpose of updating information in that book */
router.get('/:isbn/edit', middleware.isAdmin, function(req,res){
    let mysql   = req.app.get('mysql'),
        isbn    = req.params.isbn,
        sql     = `CALL sp_get_book_by_isbn(?)`,
        context = {
            stylesheets: [],
            scripts:  ["/static/js/updatebook.js"]
        };
    mysql.pool.query(sql, isbn, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }else{
            context.book = results[0][0];             
            res.render('books/edit', context);
        }
    });
});
router.route('/:isbn/hold')
    // CREATE a book loan by isbn 
    .post(middleware.isLoggedIn,
        (req, res) =>{
            let context = {},
                mysql   = req.app.get('mysql');
            console.log(`in POST -> /${req.params.isbn}/hold`);
            // this function returns an available copy number for the book that's being loaned out
            getAvailableCopy(res, mysql, req.params.isbn, context, complete);
            function complete(){
                var inserts = [req.params.isbn, context.Available, req.session.patron_id, '2017-12-01'];
                insertBookLoan(res, mysql, inserts, finalComplete)
            }
            function finalComplete(){
                // WARNING: Initially did not work on OSU server for some reason
                //res.redirect(req.get('referer')); // refreshed the current page
                res.end();
            }
        }
    )
    // Delete a book hold
    .delete(middleware.isLoggedIn,
        (req, res) => {
            console.log(`\nin DELETE -> /book/${req.params.isbn}/hold`);
            let mysql     = req.app.get('mysql'),
                isbn      = req.params['isbn'],
                patron_id = req.session.patron_id,
                inserts   = [isbn, patron_id],
                sql       = `CALL sp_delete_book_hold_by_isbn_and_patron_id(?, ?)`;

            mysql.pool.query(sql, inserts, function(error, results, fields){
                if(error){
                    console.log(`error? - ${JSON.stringify(error)}`);
                    req.flash("error", "You have already reserved this book");
                    res.end();
                }else if(results.affectedRows === 0){
                    console.log("no results found");
                    res.end();
                }
                else{
                    console.log(`results: ${JSON.stringify(results)}`);
                    console.log(`fields: ${JSON.stringify(fields)}`);
                    res.end();
                }
            });
        }
    )

router.route('/:isbn/reserve')
    // Reserve a book
    .post(middleware.isLoggedIn,
        (req, res) => {
            console.log(`reserve reserve patron_id: ${req.session.patron_id}`);
            let mysql        = req.app.get('mysql'),
                isbn         = req.params['isbn'],
                patron_id    = req.session.patron_id,
                reserve_date = new Date(),
                inserts      = [isbn, patron_id, reserve_date],
                sql          = `CALL sp_insert_book_reservation(?, ?, ?)`;

            mysql.pool.query(sql, inserts, function(error, results, fields){
                if(error){
                    console.log(`reserve error? - ${JSON.stringify(error)}`);
                    req.flash("error", "You have already reserved this book");
                    // res.write(JSON.stringify(error));
                    res.end();
                }else if(results.affectedRows === 0){
                    console.log("no results found");
                    res.end();
                }
                else{
                    // latex.latexTest();
                    console.log(`results: ${JSON.stringify(results)}`);
                    console.log(`fields: ${JSON.stringify(fields)}`);
                    res.end();
                }
            });

        }
    )
    // Delete a book reservation
    .delete(middleware.isLoggedIn,
        (req, res) => {
            let mysql     = req.app.get('mysql'),
                isbn      = req.params['isbn'],
                patron_id = req.session.patron_id,
                inserts   = [isbn, patron_id],
                sql       = `CALL sp_delete_book_reservation_by_isbn_and_patron_id(?, ?)`
            mysql.pool.query(sql, inserts, function(error, results, fields){
                if(error){
                    console.log(`error? - ${JSON.stringify(error)}`);
                    req.flash("error", "You have already reserved this book");
                    // res.write(JSON.stringify(error));
                    res.end();
                }else if(results.affectedRows === 0){
                    console.log("no results found");
                    res.end();
                }
                else{
                    console.log(`results: ${JSON.stringify(results)}`);
                    console.log(`fields: ${JSON.stringify(fields)}`);
                    res.end();
                }
            });

        }
    )
module.exports = router;

function insertBook(res, mysql, inserts, complete){
    let sql = `CALL sp_insert_book(?, ?, ?, ?, ?)`;
    mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        complete();
    });
}
function insertAuthor(res, mysql, inserts, complete){
    let sql = `CALL sp_insert_author(?, ?)`;
    mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        complete();
    });
}
function insertGenre(res, mysql, inserts, complete){
    let sql = `CALL sp_insert_genre(?)`;
    mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        complete();
    });
}
function insertPublisher(res, mysql, inserts, complete){
    let sql = `CALL sp_insert_publisher(?, ?, ?)`;
    mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        complete();
    });

}
function insertBookAuthor(res, mysql, inserts, complete) {
    let sql = `CALL sp_insert_book_author(?, ?)`;
    mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        complete();
    });
}
function insertBookGenre(res, mysql, inserts, complete){
    let sql = `CALL sp_insert_book_genre(?, ?)`;
    mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        complete();
    });
}
function insertBookCopies(res, mysql, inserts, complete){
    let sql = `CALL sp_insert_book_copy(?, ?)`;
    for(var i = 0; i < inserts[1]; i++){
        var newInserts = [inserts[0], i]; // isbn at index 0, current iteration as the current copy number
        mysql.pool.query(sql, newInserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
        });
    }
    complete();
}
function insertBookLoan(res, mysql, inserts, complete){
    let sql = `CALL sp_insert_book_hold(?, ?, ?, ?)`;
    mysql.pool.query(sql, inserts, function(error, results, fields){
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
    let sql = `CALL sp_get_available_copy_num_by_isbn(?)`;
    mysql.pool.query(sql, isbn, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        console.log(`Available_Copy results: ${JSON.stringify(results[0][0])}`);
        context.Available = results[0][0].Available_Copy;
        console.log("Got available copy. Returning");
        complete();
    });
}
function getBookByIsbn(res, mysql, isbn, context, complete){
    let sql  = `CALL sp_get_current_book_by_isbn(?)`;
    mysql.pool.query(sql, isbn, function(error, results, fields){
        if(error){
            console.log(`error: ${JSON.stringify(error)}`);
            res.write(JSON.stringify(error));
            res.end();
        }else{
            console.log(`getBookByISBN results: ${JSON.stringify(results)}`);
            //console.log(`getBooksByIsbn results: ${JSON.stringify(results[0][0])}`);
            context.book = results[0][0]; 
            complete();
        }
    });
}
function getBooks(res, mysql, context, complete){
    let sql = 'CALL sp_get_current_books()';
    mysql.pool.query(sql, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.books = results[0];
        //appendImagePath(context.Book); // we need /static/images/ to be placed before the image file's name
        complete();
    });
}
function getPublishers(res, mysql, context, complete){
    let sql = 'CALL sp_get_publishers()';
    mysql.pool.query(sql, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.publishers = results[0];
        complete();
    });
}
function getAuthors(res, mysql, context, complete){
    let sql = 'CALL sp_get_authors()';
    mysql.pool.query(sql, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.authors = results[0];
        console.log(`author results: ${JSON.stringify(results)}`);
        complete();
    });
}
function getPatrons(res, mysql, context, complete){
    let sql = 'CALL sp_get_patrons()';
    mysql.pool.query(sql, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.patrons = results[0];
        complete();
    });
}
function getGenre(res, mysql, context, complete){
    let sql = 'CALL sp_get_genres()';
    mysql.pool.query(sql, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.genres = results[0];
        complete();
    });
}
function getBookByFilter(res, mysql, context, req, complete){
    var sqlCommand = 
            "SELECT b.isbn, b.title, b.description, b.pages, b.img_file_url, p.publisher_name, p.publisher_id,  \
            (SELECT COUNT(bc.isbn) FROM Book_Copy bc WHERE b.isbn = bc.isbn) - \
            (SELECT COUNT(bh.isbn) FROM Book_Hold bh WHERE b.isbn = bh.isbn) AS Copies_Available, \
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
        console.log(`p - ${p} - type - ${typeof p}`);
        if(p === "showAllBooksCb"){
            sqlCommand += " >= 0 "
        }
        else if( p === "showAvailableBooksCb"){
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
        context.books = results;
        complete();
    });
}
function getAuthorID(res, mysql, inserts, context, complete){
    let sql = `CALL sp_get_author_by_full_name(?, ?)`;
    mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.author = results[0];    
        complete();
    });
}
function getGenreID(res, mysql, inserts, context, complete){
    let sql = `CALL sp_get_genre_by_name(/?)`;
    mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.genre = results[0];
        complete();
    });
}
function getPublisherID(res, mysql, inserts, context, complete){
    let sql = `CALL sp_get_publisher_by_name(?)`;
    mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.publisher = results[0];
        complete();
    });
}
function getBooksCheckedOutByPatron(res, mysql, inserts, context, complete){
    let sql = `CALL sp_get_book_holds_by_patron_id(?)`;
    mysql.pool.query(sql, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        console.log(`getBooksCheckedOutByPatron results: ${JSON.stringify(results)}`);
        context.holds = results[0];
        console.log(`hold found: ${JSON.stringify(results[0])}`);
        //appendImagePath(context.Book); // we need /static/images/ to be placed before the image file's name
        complete();
    });
}