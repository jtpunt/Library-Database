/*******************************************
* Author: Jonathan Perry
* Date: 12/03/17
* Assignment: CS 340 - Project
*******************************************/
var express    = require("express"),
    // middleware = require("../middleware"),
    sql        = require("../sql"),
    router = express.Router();

router.get('/',function(req,res){
    var context = {};
    context.css_scripts = ["home.css"];
    res.render('home', context);
});
router.get('/about',function(req,res){
    var context = {};
    context.css_scripts = ["about.css"];
    context.js_scripts = ["google.js"];
	res.render('about', context);
});
router.get('/books',function(req,res){
  	var callbackCount = 0;
    var context = {};
    var mysql = req.app.get('mysql');
    context.css_scripts = ["books.css"];
    context.js_scripts = ["books.js"];
    getBooks(res, mysql, context, complete);
    getPublishers(res, mysql, context, complete);
    getAuthors(res, mysql, context, complete);
    getGenres(res, mysql, context, complete);
    getPatrons(res, mysql, context, complete);
    function complete(){
        callbackCount++;
        if(callbackCount >= 5){
            res.render('books', context);
        }
    }
});
router.post('/books',function(req,res){
    var context = {};
    var mysql = req.app.get('mysql');
    // this function returns an available copy number for the book that's being loaned out
    getAvailableCopy(res, mysql, [req.body.isbn, req.body.isbn], context, complete);
    function complete(){
        var inserts = [req.body.isbn, context.Available, req.body.patron_id, '2017-12-01'];
        insertBookLoan(res, mysql, inserts, finalComplete)
    }
    function finalComplete(){
        // WARNING: Initially did not work on OSU server for some reason
        //res.redirect(req.get('referer')); // refreshed the current page
        res.end();
    }
});
router.delete('/books', function(req,res){
    var mysql = req.app.get('mysql');
    console.log(req.body.isbn);
    var inserts = [req.params.id];
    mysql.pool.query(sql.delBookByISBN, req.body.isbn, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.status(400).end();
        }
        res.end();
    });
});
router.get('/books/filter',function(req,res){
    var callbackCount = 0;
    var context = {};
    var mysql = req.app.get('mysql');
    context.css_scripts = ["books.css"];
    context.js_scripts = ["books.js"];
    getBooksByFilter(res, mysql, context, req, complete);
    getPublishers(res, mysql, context, complete);
    getAuthors(res, mysql, context, complete);
    getGenres(res, mysql, context, complete);
    getPatrons(res, mysql, context, complete);
    function complete(){
        callbackCount++;
        if(callbackCount >= 5){
            res.render('books', context);
        }
    }
});
/* Display one book for the specific purpose of updating information in that book */
router.get('/books/:id', function(req,res){
    var context = {};
    var mysql = req.app.get('mysql');
    context.js_scripts = ["updatebook.js"];
    context.css_scripts = ["addBooks.css"];
    mysql.pool.query(sql.getBooksByISBN, req.params.id, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }else
            context.book = results[0];             
            res.render('update-book', context);
    });
});
/* The URI that update data is sent to in order to update a book */
router.put('/books/:isbn',function(req,res){
    console.log(" in update route");
    var mysql = req.app.get('mysql');
    var inserts = [req.body.title, req.body.desc, req.body.pages, req.body.img_file_url, req.body.isbn];
    mysql.pool.query(sql.editBookByISBN, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }else{
            res.status(200);
            res.redirect("/books");
        }
    });
});
router.get('/addBooks',function(req,res){
    var callbackCount = 0;
    var context = {};
    context.css_scripts = ["addBooks.css"];
    context.js_scripts = ["addBooks.js"];
    var mysql = req.app.get('mysql');
    getPublishers(res, mysql, context, complete);
    getAuthors(res, mysql, context, complete);
    getGenres(res, mysql, context, complete);
    function complete(){
        callbackCount++;
        if(callbackCount >= 3){
            res.render('addBooks', context);
        }
    }
});
/* Adds a book, redirects to the book page after adding */
router.post('/addBooks', function(req, res){
    var context = {};
    var childCallCount = 0;
    var parentCalls = 0;
    var parentCallCount = 0;
    var flag = false; // false - we have parent table data to insert. true - we only have child table data to insert
    var mysql = req.app.get('mysql');

    // insert data for parent tables (authors, genres, publishers), which has to be added into the database before other data is added in
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

    // skip ahead to insert data into the Books table, Book_Authors, Book_Copies, and Book_Genre tables
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
                    res.redirect('books');
                }
            }
        }
    }  
});
router.get('/resume',function(req,res){
	res.render('resume');
});
router.use(function(req,res){
		res.status(404);
		res.render('404');
});
router.use(function(err, req, res, next){
		console.error(err.stack);
		res.type('plain/text');
		res.status(500);
		res.render('500');
});
module.exports = router;
function insertBook(res, mysql, inserts, complete){
    mysql.pool.query(sql.setNewBook, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        complete();
    });
}
function insertAuthor(res, mysql, inserts, complete){
    mysql.pool.query(sql.setNewAuthor, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        complete();
    });
}
function insertGenre(res, mysql, inserts, complete){
    mysql.pool.query(sql.setNewGenre, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        complete();
    });
}
function insertPublisher(res, mysql, inserts, complete){
    mysql.pool.query(sql.setNewAuthor, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        complete();
    });

}
function insertBookAuthor(res, mysql, inserts, complete) {
    mysql.pool.query(sql.setBookAuthor, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        complete();
    });
}
function insertBookGenre(res, mysql, inserts, complete){
    mysql.pool.query(sql.setBookGenre, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        complete();
    });
}
function insertBookCopies(res, mysql, inserts, complete){
    for(var i = 0; i < inserts[1]; i++){
        var newInserts = [inserts[0], i]; // isbn at index 0, current iteration as the current copy number
        mysql.pool.query(sql.setBookCopy, newInserts, function(error, results, fields){
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
    mysql.pool.query(sql.setBookLoan, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        complete();
    });
}
function getAvailableCopy(res, mysql, isbn, context, complete){
    mysql.pool.query(sql.getAvailableCopy, isbn, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.Available = results[0].Available_Copy;
        console.log("Got available copy. Returning");
        complete();
    });
}
function getBooks(res, mysql, context, complete){
    mysql.pool.query(sql.getBooks, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.Books = results;
        //appendImagePath(context.Books); // we need /static/images/ to be placed before the image file's name
        complete();
    });
}
function getPublishers(res, mysql, context, complete){
    mysql.pool.query(sql.getPublishers, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.Publishers = results;
        complete();
    });
}
function getAuthors(res, mysql, context, complete){
    mysql.pool.query(sql.getAuthors, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.Authors = results;
        complete();
    });
}
function getPatrons(res, mysql, context, complete){
    mysql.pool.query(sql.getPatrons, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.Patrons = results;
        complete();
    });
}
function getGenres(res, mysql, context, complete){
    mysql.pool.query(sql.getGenres, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.Genres = results;
        complete();
    });
}
function getBooksByFilter(res, mysql, context, req, complete){
    var sqlCommand = sql.getBooksByFilter;
    for(p in req.query){ 
        var table;
        if(p === "publisher_id") table = "p."
        else if(p === "genre_id") table = "g."
        else table = "a."
        sqlCommand += ("&& " + table + p + " = " + req.query[p] + " ");
    }
    sqlCommand += "ORDER BY b.title;";
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
    mysql.pool.query(sql.getAuthorID, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.author = results[0];    
        complete();
    });
}
function getGenreID(res, mysql, inserts, context, complete){
    mysql.pool.query(sql.getGenreID, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.genre = results[0];
        complete();
    });
}
function getPublisherID(res, mysql, inserts, context, complete){
    mysql.pool.query(sql.getPublisherID, inserts, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.publisher = results[0];
        complete();
    });
}