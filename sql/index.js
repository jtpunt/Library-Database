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

    getBooksByFilter: "SELECT b.isbn, b.title, b.description, b.pages, b.img_file_url, p.publisher_name, p.publisher_id,  \
    (SELECT COUNT(bc.isbn) FROM Book_Copies bc WHERE b.isbn = bc.isbn) - \
    (SELECT COUNT(bl.isbn) FROM Book_Loans bl WHERE b.isbn = bl.isbn) AS Copies_Available, \
    CONCAT(a.first_name, ' ', a.last_name) AS Author_Name, a.author_id, g.genre_id, g.genre_name FROM Books b \
    INNER JOIN Publishers p ON b.publisher_id = p.publisher_id \
    INNER JOIN Book_Genres bg ON b.isbn = bg.isbn \
    INNER JOIN Genres g ON bg.genre_id = g.genre_id \
    INNER JOIN Book_Authors ba ON b.isbn =  ba.isbn \
    INNER JOIN Authors a ON ba.author_id = a.author_id \
    GROUP BY b.isbn, Author_Name, a.author_id, g.genre_id, g.genre_name HAVING Copies_Available > 0;",

    getAuthorID: "SELECT author_id FROM Authors WHERE last_name = ? && first_name = ?",

    getGenreID: "SELECT genre_id FROM Genres WHERE genre_name = ?",

    getPublisherID: "SELECT publisher_id FROM Publishers WHERE publisher_name = ?;",
	// UPDATE
	editBook: "UPDATE Books SET title=?, description=?, pages=?, img_file_url=? WHERE isbn=?;",
	
	// DELETE
	deleteUser: "DELETE FROM Employee WHERE id = ?;",
	
	deleteAward: "DELETE FROM Granted WHERE id = ?",

	// CREATE
	createUser: (req, res, sql, redirect) => {
		var formidable = require('formidable');
		var fs = require('fs');
		var mysql = req.app.get('mysql');
		var username = ""; // used to fix the scope problem below
		var form = new formidable.IncomingForm();
		form.parse(req, (err, fields, files) => {
			username=fields.username;
			if(!validateNums(Number(fields.permission), Number(fields.emp_select))){
				res.redirect(redirect);
			}else{
				if(files.signature.name === ""){ // no file has been sent
					console.log("no file sent");
	                var inserts = [fields.username, fields.password, fields.secret, null, fields.permission, fields.emp_select];
					mysql.pool.query(sql, inserts, (error, results, fields) => {
						if(error){
			            	req.flash("error", JSON.stringify(error));
			            	res.redirect(redirect);
				        }else if(results.affectedRows == 0){
			       			req.flash("error", username + ": not added!");
			            	res.redirect(redirect);
						}else{
			            	req.flash("success", username + " successfully added!");
			            	res.redirect(redirect);
				        }
					});
				}else{
					console.log("signature file uploaded");
					// '/nfs/stak/users/perryjon/testCapstone
					var oldpath = files.signature.path;
					// Read the file
			        fs.readFile(oldpath, 'base64', (err, data) => {
			            if (err) throw err;
		                // Delete the old file
			            fs.unlink(oldpath, (err) => { if (err) throw err; });
		                var inserts = [fields.username, fields.password, fields.secret, data, fields.permission, fields.emp_select];
						mysql.pool.query(sql, inserts, (error, results, fields) => {
							if(error){
				            	req.flash("error", JSON.stringify(error));
				            	res.redirect(redirect);
					        }else if(results.affectedRows == 0){
				       			req.flash("error", username + ": not found!");
				            	res.redirect(redirect);
							}else{
				            	req.flash("success", username + " successfully added!");
				            	res.redirect(redirect);
					        }
						});
		            });
				}
			}
		});
	},
	createAward: (req, res, sql, redirect) => {
		if(!validateNums(Number(req.body.award_id), Number(req.body.emp_select))){
			res.redirect(redirect);
		}else{
			var mysql = req.app.get('mysql');
			var inserts = [req.session.user_id, req.body.award_id, req.body.emp_select, require('moment')().format('YYYY-MM-DD hh:mm:ss')];
			mysql.pool.query(sql,inserts, function(error, results, fields){
		        if(error){
		            req.flash("error", JSON.stringify(error));
		            res.redirect(redirect);
		        }else if(results.affectedRows == 0){
		            req.flash("error", "Award not added!");
		            res.redirect(redirect);
		        }else{
		            req.flash("success", "Award successfully added!");
		            console.log(inserts[3]);
		            latex.genLatex(inserts[0], inserts[1], inserts[2], inserts[3]);
	               	console.log(inserts[3]);
		            res.redirect(redirect);
		        }
		    });
		}
	},
	// RETRIEVE
	find: (req, res, sql, redirect, render, stylesheets, scripts) => {
		var mysql = req.app.get('mysql');
		mysql.pool.query(sql, (error, results, fields) => {
			if(error){
	            req.flash("error", JSON.stringify(error));
	            res.redirect(redirect);
	        }else{
	            // req.flash("success", "Flash works!");
				res.render(render, {results: results, stylesheets: stylesheets, scripts: scripts});
	        }
		});
	},
	findById: (req, res, sql, redirect, render, stylesheets, scripts) => {
		if(!validateNums(Number(req.params.id))){
			res.redirect(redirect);
		}else{
			var mysql = req.app.get('mysql');
			console.log(req.params.id);
			console.log(sql);
			mysql.pool.query(sql, req.params.id, (error, results, fields) => {
				if(error){
		            req.flash("error", JSON.stringify(error));
		            console.log(JSON.stringify(error));
		            res.redirect(redirect);
		        }else if(results[0] == undefined){
	        		req.flash("error", req.params.id + ": not found!");
	            	res.redirect(redirect);
	        	}else{
		        	console.log(results);
					res.render(render, {results: results, stylesheets: stylesheets, scripts: scripts});
		        }
			});
		}
	},
	findAndRet: (req, res, sql, redirect) => {
		var mysql = req.app.get('mysql');
		mysql.pool.query(sql, (error, results, fields) => {
			if(error){
	            req.flash("error", JSON.stringify(error));
	            res.redirect(redirect);
	        }else{
	            // req.flash("success", "Flash works!");
	            console.log("in findAndRet with: ", results);
				res.write(JSON.stringify(results));
				res.end();
	        }
		});
	},
	findByIdAndRet: (req, res, sql, redirect) => {
		// admins can request loc/dept/employee data
		// users can request employee name data and view the awards they granted to other employees
		var id = req.params.id || req.session.user_id; 
		if(!validateNums(Number(id))){
			res.redirect(redirect);
		}else{
			var mysql = req.app.get('mysql');
			mysql.pool.query(sql, id, (error, results, fields) => {
				if(error){
		            req.flash("error", JSON.stringify(error));
		            console.log(JSON.stringify(error));
		            res.redirect(redirect);
		        }else if(results[0] == undefined){
	        		req.flash("error", id + ": not found!");
	            	res.redirect(redirect);
	        	}else{
		        	console.log(results);
					res.write(JSON.stringify(results));
					res.end();
		        }
			});
		}
	},
	// UPDATE
	updateUser: (req, res, sql, redirect) => { 
		// can try a get request with the query param passed in, or allow the user to update their name
		var id = req.params.id || req.session.user_id; 
		if(!validateNums(Number(id))){
			res.redirect(redirect);
		}else if(req.session.user_id){
			var username = ""; // used to fix the scope problem below
			var formidable = require('formidable');
			var mysql = req.app.get('mysql');
			var form = new formidable.IncomingForm();
			form.parse(req, function(err, fields, files){
				username=fields.username; // fixes the scope problem of reassigning the session's username
				mysql.pool.query(sql, [fields.username, id], function(error, results, fields) {
					if(error){
		            	req.flash("error", JSON.stringify(error));
		            	res.redirect(redirect);
			        }else if(results.affectedRows == 0){
		       			req.flash("error", id + ": not found!");
		            	res.redirect(redirect);
					}else{
						req.session.username=username;
		            	req.flash("success", "Username successfully updated!");
		            	res.redirect(redirect);
			        }
				});
			});
		}else{
			var formidable = require('formidable');
			var fs = require('fs');
			var mysql = req.app.get('mysql');
			var form = new formidable.IncomingForm();
			form.parse(req, (err, fields, files) => {
				if(!validateNums(Number(fields.permission))){
					res.redirect(redirect);
				}else{
					if(files.signature.name === ""){ // no file has been sent
						console.log("no file sent");
		                var inserts = [fields.username, fields.password, fields.secret, fields.permission, id];
		                sql="UPDATE User SET username=?, password=?, secret=?, permission=? WHERE id=?;" // Removed signature db field so it is not overwritten with null
						mysql.pool.query(sql, inserts, (error, results, fields) => {
							if(error){
				            	req.flash("error", JSON.stringify(error));
				            	res.redirect(redirect);
					        }else if(results.affectedRows == 0){
				       			req.flash("error", id + ": not found!");
				            	res.redirect(redirect);
							}else{
				            	req.flash("success", id + " successfully updated!");
				            	res.redirect(redirect);
					        }
						});
					}else{
						// '/nfs/stak/users/perryjon/testCapstone
						var oldpath = files.signature.path;
						// Read the file
				        fs.readFile(oldpath, 'base64', (err, data) => {
				            if (err) throw err;
			                // Delete the old file
				            fs.unlink(oldpath, (err) => { if (err) throw err; });
			                var inserts = [fields.username, fields.password, fields.secret, data, fields.permission, id];
							mysql.pool.query(sql, inserts, (error, results, fields) => {
								if(error){
					            	req.flash("error", JSON.stringify(error));
					            	res.redirect(redirect);
						        }else if(results.affectedRows == 0){
					       			req.flash("error", id + ": not found!");
					            	res.redirect(redirect);
								}else{
					            	req.flash("success", id + " successfully updated!");
					            	res.redirect(redirect);
						        }
							});
			            });
					}
				}
			});
		}
	},
	// DELETE
	removeEmployee: (req, res, sql, redirect) => {
		var id = req.params.id;
		if(!validateNums(Number(id))){
			res.redirect(redirect);
		}else{
			var mysql = req.app.get('mysql');
			mysql.pool.query(sql, id, (error, results, fields) => {
				if(error){
	            	req.flash("error", JSON.stringify(error));
	            	res.redirect(redirect);
		        }else if(results.affectedRows == 0){
	       			req.flash("error", id + ": not found!");
	            	res.redirect(redirect);
				}else{
	            	// req.flash("success", id + " successfully deleted!");
	            	res.status(200).end();
		        }
			});
		}
	},
	removeAward: (req, res, sql, redirect) => {
		var id = req.params.id;
		if(!validateNums(Number(id))){
			res.redirect(redirect);
		}else{
			var mysql = req.app.get('mysql');
			mysql.pool.query(sql, id, (error, results, fields) => {
				if(error){
	            	req.flash("error", JSON.stringify(error));
	            	res.redirect(redirect);
		        }else if(results.affectedRows == 0){
	       			req.flash("error", id + ": not found!");
	            	res.redirect(redirect);
				}else{
	            	// req.flash("success", id + " successfully deleted!");
	            	res.status(200).end();
		        }
			});
		}
	}
}
function validateNums(...numbers){
	console.log("in validateNums with: ", numbers);
	var result = true;
	numbers.forEach((num) => {
		if(isNaN(num)){
			result = false;
		}
	});
	return result;
}
module.exports = sql