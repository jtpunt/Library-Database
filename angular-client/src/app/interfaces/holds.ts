export interface Hold {
    isbn: String,
    title: String,
    description: String,
    page: Number,
    img_file_url: String
}
export interface Holds {
    holds: Array<Hold>;
}