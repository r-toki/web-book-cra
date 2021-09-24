import { curry } from 'lodash-es'
import { useParams } from 'react-router-dom'

import { Book, BookModel, useBook } from '@/model/book'
import { Chapter, ChapterModel, useChapters } from '@/model/chapter'

export const useAdminBookEditPageQuery = () => {
  const { bookId } = useParams<{ bookId: string }>()

  const book = useBook({ bookId })
  const chapters = useChapters({ bookId })

  return {
    book,
    chapters,
  }
}

export const useAdminBookEditPageMutation = ({
  book,
  chapters,
}: {
  book: Book
  chapters: Chapter[]
}) => {
  const saveBook = curry(BookModel.saveBook)(book)
  const saveBookDetail = curry(BookModel.saveBookDetail)(book)
  const uploadBookCover = curry(BookModel.uploadBookCover)(book)
  const deleteBookCover = () => BookModel.deleteBookCover(book)

  const addChapter = () => ChapterModel.addChapter(book, { number: chapters.length + 1 })

  return {
    saveBook,
    saveBookDetail,
    uploadBookCover,
    deleteBookCover,
    addChapter,
  }
}
