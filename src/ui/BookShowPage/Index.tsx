import { CheckIcon } from '@chakra-ui/icons'
import { Box, Button, Divider, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { format } from 'date-fns'
import { every, sumBy } from 'lodash-es'
import { VFC } from 'react'
import { BiCart } from 'react-icons/bi'
import { useHistory } from 'react-router'

import { useMarked } from '@/hooks/useMarked'
import { numberToTwoDigits } from '@/lib/display'
import { Book } from '@/model/book'
import { chapterSummary } from '@/model/chapterSummary'
import { routeMap } from '@/routes'
import { useAuth } from '@/service/auth'
import { UserPageLayout } from '@/ui/Layout/UserPageLayout'
import { BookImage } from '@/ui/Shared/BookImage'

import { useBookShowPageMutation, useBookShowPageQuery } from './container'

export type BookShowPageProps = {
  book: Book
  chapterSummaries: chapterSummary[]
}

const BookShowPage: VFC<BookShowPageProps> = ({ book, chapterSummaries }) => {
  // app
  const history = useHistory()
  const { user } = useAuth()

  // container
  const { addBookToCart } = useBookShowPageMutation(book)

  // ui
  const markedDescription = useMarked(book.description)

  return (
    <HStack alignSelf="stretch" alignItems="start" spacing="8">
      <BookImage imageUrl={book.image?.url} size="md" flexShrink={0} />

      <VStack alignItems="start" flex={1}>
        <Box>
          <Text fontWeight="bold" fontSize="2xl">
            {book.title}
          </Text>
          <Text fontWeight="bold" color="gray.500">
            {book.authorNames.join(', ')}
          </Text>
        </Box>

        <Divider />

        <Box className="markdown-body" dangerouslySetInnerHTML={{ __html: markedDescription }} />

        <Divider />

        <VStack alignItems="start">
          <Text fontWeight="bold" fontSize="2xl">
            Chapters
          </Text>
          <VStack alignItems="stretch" spacing="0.5">
            {chapterSummaries.map((chapter) => (
              <HStack key={chapter.id}>
                <Text fontWeight="bold" fontFamily="mono" color="blue.300">
                  {numberToTwoDigits(chapter.number)}
                </Text>
                <Text color="gray.500" fontWeight="bold">
                  {chapter.title || '無題のチャプター'}
                </Text>
              </HStack>
            ))}
          </VStack>
        </VStack>
      </VStack>

      <Box flexShrink={0} w="60" p="6" borderWidth="1px" borderRadius="md">
        <VStack spacing="8" alignItems="stretch">
          {(() => {
            if (!user) {
              return (
                <Button
                  onClick={() => {
                    history.push(routeMap['/sign-in'].path())
                  }}
                >
                  サインインして購入する
                </Button>
              )
            }

            if (book.purchaserIds.includes(user.id)) {
              return (
                <Button disabled colorScheme="blue" leftIcon={<CheckIcon />}>
                  購入済み
                </Button>
              )
            }

            if (book.ordererIds.includes(user.id)) {
              return (
                <Button disabled colorScheme="blue" leftIcon={<CheckIcon />}>
                  注文済み
                </Button>
              )
            }

            if (user.cart.includes(book.id)) {
              return (
                <Button disabled colorScheme="blue" leftIcon={<CheckIcon />}>
                  カートに登録済み
                </Button>
              )
            }

            return (
              <Button
                colorScheme="blue"
                w="full"
                leftIcon={<Icon as={BiCart} h="6" w="6" />}
                onClick={addBookToCart}
              >
                カートに入れる
              </Button>
            )
          })()}

          <VStack alignSelf="stretch" alignItems="stretch">
            <HStack justifyContent="space-between" color="gray.500">
              <Text>発売日</Text>
              <Text>{book.releasedAt ? format(book.releasedAt.toDate(), 'yyyy-MM-dd') : ''}</Text>
            </HStack>

            <Divider />

            <HStack justifyContent="space-between" color="gray.500">
              <Text>文字量</Text>
              <Text>{sumBy(chapterSummaries, ({ wardCount }) => wardCount)}</Text>
            </HStack>

            <Divider />

            <HStack justifyContent="space-between" color="gray.500">
              <Text>価格</Text>
              <Text color="black" fontWeight="bold">
                {book.price} 円
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </Box>
    </HStack>
  )
}

const WithLayout = UserPageLayout(BookShowPage)

const Wrapper: VFC = () => {
  const { book, chapterSummaries } = useBookShowPageQuery()

  return (
    <>
      {every([book, chapterSummaries], Boolean) && (
        <WithLayout book={book!} chapterSummaries={chapterSummaries!} />
      )}
    </>
  )
}

export default Wrapper
