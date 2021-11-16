export interface Book {
    isbn: String,
    title: String,
    description: String,
    page: Number,
    img_file_url: String
}
export interface Books {
    books: Array<Book>;
}